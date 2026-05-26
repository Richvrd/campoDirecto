# Graphify Audit Report

## Project
CampoDirecto — Agricultural Marketplace (Laravel + React Native)

## Summary
- **Total Nodes:** 477
- **Total Edges:** 593
- **Total Communities:** 40

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
- Total nodes after dedup: 477
- Total edges after dedup: 593

### 5. Community Detection
- Algorithm: Louvain (NetworkX)
- Communities found: 40

## Community Breakdown
- Community 0: 43 nodes [code=43]
- Community 1: 20 nodes [code=20]
- Community 2: 1 nodes [code=1]
- Community 3: 1 nodes [code=1]
- Community 4: 9 nodes [code=9]
- Community 5: 11 nodes [code=11]
- Community 6: 8 nodes [code=8]
- Community 7: 1 nodes [code=1]
- Community 8: 1 nodes [code=1]
- Community 9: 5 nodes [code=5]
- Community 10: 1 nodes [code=1]
- Community 11: 1 nodes [code=1]
- Community 12: 1 nodes [code=1]
- Community 13: 1 nodes [code=1]
- Community 14: 5 nodes [code=5]
- Community 15: 1 nodes [code=1]
- Community 16: 1 nodes [code=1]
- Community 17: 4 nodes [code=4]
- Community 18: 1 nodes [code=1]
- Community 19: 1 nodes [code=1]
- Community 20: 2 nodes [code=2]
- Community 21: 12 nodes [code=12]
- Community 22: 2 nodes [code=2]
- Community 23: 3 nodes [code=3]
- Community 24: 5 nodes [code=5]
- Community 25: 3 nodes [code=3]
- Community 26: 24 nodes [code=24]
- Community 27: 38 nodes [code=38]
- Community 28: 5 nodes [code=5]
- Community 29: 23 nodes [code=23]
- Community 30: 38 nodes [code=38]
- Community 31: 60 nodes [code=60]
- Community 32: 3 nodes [code=3]
- Community 33: 37 nodes [document=5, code=26, image=6]
- Community 34: 2 nodes [code=2]
- Community 35: 15 nodes [code=15]
- Community 36: 48 nodes [code=48]
- Community 37: 17 nodes [code=17]
- Community 38: 8 nodes [code=8]
- Community 39: 15 nodes [code=15]

## Output Files
- `conhecimento.html` — Interactive D3.js force-directed graph
- `conhecimento.json` — Full graph data with communities and positions
- `conhecimento_report.md` — This audit report

## Notes
- D3.js loaded from CDN (requires internet)
- Positions computed via Fruchterman-Reingold with community color encoding
