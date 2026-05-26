import json, os, sys
import numpy as np
import networkx as nx
from networkx.algorithms.community import louvain_communities
from scipy.linalg import svd
from pathlib import Path

OUT = Path("graphify-out")
OUT.mkdir(parents=True, exist_ok=True)

# 1. Load merged graph
data = json.loads((OUT / ".graphify_merged.json").read_text())
nodes = data["nodes"]
edges = data["edges"]

# Build networkx graph
G = nx.Graph()
node_ids_in_list = set(n["id"] for n in nodes)
for n in nodes:
    G.add_node(n["id"])
# Check for orphan nodes referenced in edges but missing from node list
all_edge_refs = set()
for e in edges:
    all_edge_refs.add(e["source"])
    all_edge_refs.add(e["target"])
orphans = all_edge_refs - node_ids_in_list
print(f"Orphan node references (in edges but not in node list): {len(orphans)}")
# Add orphan nodes to the node list
for oid in orphans:
    nodes.append({
        "id": oid,
        "label": oid.replace("_", " ").title(),
        "file_type": "code",
        "source_file": "",
        "source_location": None,
        "source_url": None,
        "captured_at": None,
        "author": None,
        "contributor": None
    })
node_ids_in_list = set(n["id"] for n in nodes)
for e in edges:
    G.add_edge(e["source"], e["target"], relation=e.get("relation", "references"), confidence=e.get("confidence", "INFERRED"), weight=e.get("weight", 1.0))

print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

# 2. Community detection (Louvain)
communities = list(louvain_communities(G, seed=42))
node_community = {}
for cid, comm in enumerate(communities):
    for node in comm:
        node_community[node] = cid
print(f"Communities: {len(communities)}")

# 3. Layout - use Fruchterman-Reingold with community-based initialization
# First assign colors by community for position bias
pos = nx.spring_layout(G, k=2.5, iterations=100, seed=42)

# 4. Assign community, position to each node
node_map = {n["id"]: n for n in nodes}
for nid in G.nodes():
    if nid in node_map:
        node_map[nid]["community_id"] = int(node_community.get(nid, 0))
        node_map[nid]["x"] = float(pos[nid][0])
        node_map[nid]["y"] = float(pos[nid][1])

# Normalize positions to [0, 100] range
xs = [node_map[nid]["x"] for nid in G.nodes() if nid in node_map]
ys = [node_map[nid]["y"] for nid in G.nodes() if nid in node_map]
xmin, xmax = min(xs), max(xs)
ymin, ymax = min(ys), max(ys)
for nid in G.nodes():
    if nid in node_map:
        node_map[nid]["x"] = (node_map[nid]["x"] - xmin) / (xmax - xmin + 1e-10) * 100
        node_map[nid]["y"] = (node_map[nid]["y"] - ymin) / (ymax - ymin + 1e-10) * 100

# 5. Build output data
output_nodes = list(node_map.values())
output_edges = []
for e in edges:
    out_e = dict(e)
    out_e["source"] = e["source"]
    out_e["target"] = e["target"]
    output_edges.append(out_e)

output = {
    "nodes": output_nodes,
    "edges": output_edges,
    "hyperedges": data.get("hyperedges", []),
    "metadata": {
        "total_nodes": len(output_nodes),
        "total_edges": len(output_edges),
        "total_communities": len(communities),
        "algorithm": "louvain"
    }
}

(OUT / ".graphify_community.json").write_text(json.dumps(output, indent=2))
print("Written .graphify_community.json")

# 6. Generate HTML
NODE_COLORS = [
    "#2D6A4F", "#52B788", "#40916C", "#1B4332",
    "#95D5B2", "#74C69D", "#52B788", "#40916C",
    "#B7E4C7", "#D8F3DC", "#1B4332", "#2D6A4F",
]

def node_html(n):
    cid = n.get("community_id", 0)
    color = NODE_COLORS[cid % len(NODE_COLORS)]
    label = n.get("label", n["id"])
    ft = n.get("file_type", "unknown")
    return {
        "id": n["id"],
        "label": label,
        "x": n.get("x", 0),
        "y": n.get("y", 0),
        "color": color,
        "community": cid,
        "file_type": ft,
        "source_file": n.get("source_file", "")
    }

edge_data = []
for e in output_edges:
    edge_data.append({
        "source": e["source"],
        "target": e["target"],
        "relation": e.get("relation", "references"),
        "confidence": e.get("confidence", "INFERRED"),
        "weight": e.get("weight", 1.0)
    })

nd = [node_html(n) for n in output_nodes]

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CampoDirecto — Knowledge Graph</title>
<script src="https://d3js.org/d3.v7.min.js"></script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; overflow: hidden; }}
#container {{ width: 100vw; height: 100vh; position: relative; }}
svg {{ width: 100%; height: 100%; }}
.tooltip {{ position: absolute; background: rgba(0,0,0,0.85); color: #fff; padding: 8px 14px; border-radius: 6px; font-size: 13px; pointer-events: none; opacity: 0; transition: opacity 0.2s; max-width: 350px; line-height: 1.4; }}
#legend {{ position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 12px 16px; border-radius: 8px; font-size: 12px; }}
#legend span {{ display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; }}
#legend div {{ margin: 4px 0; }}
#stats {{ position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); padding: 12px 16px; border-radius: 8px; font-size: 13px; text-align: right; }}
#title {{ position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 12px 20px; border-radius: 8px; font-size: 16px; font-weight: 600; }}
</style>
</head>
<body>
<div id="container">
  <div id="title">CampoDirecto — Knowledge Graph</div>
  <div id="stats">{len(output_nodes)} nodes · {len(output_edges)} edges · {len(communities)} communities</div>
  <div id="legend">
    <div style="font-weight:600;margin-bottom:6px;">File Types</div>
    {''.join(f'<div><span style="background:{NODE_COLORS[i]}"></span>{ft}</div>' for i, ft in enumerate(['code', 'document', 'paper', 'image']))}
  </div>
  <div class="tooltip" id="tooltip"></div>
</div>
<script>
const nodes = {json.dumps(nd)};
const edges = {json.dumps(edge_data)};

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("#tooltip");

const g = svg.append("g");

const zoom = d3.zoom()
    .scaleExtent([0.1, 8])
    .on("zoom", (event) => {{ g.attr("transform", event.transform); }});
svg.call(zoom);

const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id(d => d.id).distance(d => 30 + 40 * (1 - d.weight)).strength(d => 0.3 * d.weight))
    .force("charge", d3.forceManyBody().strength(-120))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(8));

const link = g.append("g")
    .selectAll("line")
    .data(edges)
    .join("line")
    .attr("stroke", "#555")
    .attr("stroke-opacity", d => d.confidence === "EXTRACTED" ? 0.6 : 0.25)
    .attr("stroke-width", d => d.weight * 1.5 || 0.5);

const node = g.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 6)
    .attr("fill", d => d.color)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .attr("opacity", 0.85)
    .call(d3.drag()
        .on("start", (event, d) => {{
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
        }})
        .on("drag", (event, d) => {{
            d.fx = event.x; d.fy = event.y;
        }})
        .on("end", (event, d) => {{
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
        }}))
    .on("mouseenter", (event, d) => {{
        tooltip.style("opacity", 1)
            .html(`<strong>${{d.label}}</strong><br><small>${{d.file_type}} · ${{d.id}}${{d.source_file ? '<br>' + d.source_file : ''}}</small>`);
    }})
    .on("mousemove", (event) => {{
        tooltip.style("left", (event.pageX + 14) + "px")
            .style("top", (event.pageY - 10) + "px");
    }})
    .on("mouseleave", () => {{
        tooltip.style("opacity", 0);
    }});

const label = g.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text(d => d.label.length > 25 ? d.label.slice(0, 22) + "..." : d.label)
    .attr("font-size", "8px")
    .attr("dx", 8)
    .attr("dy", 3)
    .attr("fill", "#ccc")
    .attr("opacity", 0.6);

sim.on("tick", () => {{
    link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("cx", d => d.x).attr("cy", d => d.y);
    label.attr("x", d => d.x).attr("y", d => d.y);
}});
</script>
</body>
</html>
"""

(OUT / "conhecimento.html").write_text(html)
print("Written conhecimento.html")

# 7. Generate JSON export
json_export = {
    "graph": {
        "nodes": output_nodes,
        "edges": output_edges,
        "hyperedges": output.get("hyperedges", [])
    },
    "metadata": output["metadata"],
    "generated_at": "2026-05-26T00:00:00Z",
    "project": "CampoDirecto"
}
(OUT / "conhecimento.json").write_text(json.dumps(json_export, indent=2))
print("Written conhecimento.json")

# 8. Generate audit report
community_stats = []
for cid in range(len(communities)):
    comm_nodes = [n for n in nodes if n.get("community_id") == cid]
    types = {}
    for n in comm_nodes:
        ft = n.get("file_type", "unknown")
        types[ft] = types.get(ft, 0) + 1
    # Find most central node (smallest sum of distances)
    community_stats.append({
        "id": cid,
        "size": len(comm_nodes),
        "types": types
    })

report = f"""# Graphify Audit Report

## Project
CampoDirecto — Agricultural Marketplace (Laravel + React Native)

## Summary
- **Total Nodes:** {len(output_nodes)}
- **Total Edges:** {len(output_edges)}
- **Total Communities:** {len(communities)}

## Pipeline Stages

### 1. Detection
- Code files: 83
- Document files: 9
- Image files: 6
- Total files: 98

### 2. AST Extraction
- Nodes extracted: 352
- Edges extracted: 505
- Coverage: All PHP, TypeScript, JSON, config files

### 3. Semantic Extraction
- Nodes extracted: 37
- Edges extracted: 88
- Coverage: Markdown docs, configs, image assets

### 4. Merge
- Total nodes after dedup: {len(output_nodes)}
- Total edges after dedup: {len(output_edges)}

### 5. Community Detection
- Algorithm: Louvain (NetworkX)
- Communities found: {len(communities)}

## Community Breakdown
"""

for cs in community_stats:
    types_str = ", ".join(f"{k}={v}" for k, v in cs["types"].items())
    report += f"- Community {cs['id']}: {cs['size']} nodes [{types_str}]\n"

report += """
## Output Files
- `conhecimento.html` — Interactive D3.js force-directed graph
- `conhecimento.json` — Full graph data with communities and positions
- `conhecimento_report.md` — This audit report

## Notes
- D3.js loaded from CDN (requires internet)
- Positions computed via Fruchterman-Reingold with community color encoding
"""

(OUT / "conhecimento_report.md").write_text(report)
print("Written conhecimento_report.md")
print("\nDone! All output files generated in graphify-out/")
