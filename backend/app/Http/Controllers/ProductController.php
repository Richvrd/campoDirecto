<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Traits\ApiResponse;
use Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();

        if ($request->has('mine') && $request->mine) {
            $query = Product::with(['user.location', 'category'])
                ->where('user_id', $user->id);
        } else {
            $query = Product::with(['user.location', 'category'])
                ->where('status', 'disponible');
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('commune')) {
            $query->whereHas('user.location', function ($q) use ($request) {
                $q->where('commune', 'like', '%' . $request->commune . '%');
            });
        }

        $products = $query->paginate(20);

        return $this->success($products);
    }

    public function show($id)
    {
        $product = Product::with(['user.location', 'category', 'user'])->find($id);

        if (!$product) {
            return $this->error('Producto no encontrado', 404);
        }

        return $this->success($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:30',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:5120',
            'status' => 'nullable|in:disponible,agotado,pausado',
        ]);

        $validated['user_id'] = $request->user()->id;
        
        if ($request->hasFile('image')) {
            $uploaded = Cloudinary::upload(
                $request->file('image')->getRealPath(),
                ['folder' => 'campodirecto/products']
            );
            $validated['image_url'] = $uploaded->getSecurePath();
        }

        $product = Product::create($validated);

        return $this->success($product, 'Producto creado exitosamente', 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->error('Producto no encontrado', 404);
        }

        if ($product->user_id !== $request->user()->id) {
            return $this->error('No tienes permiso para editar este producto', 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:30',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:5120',
            'status' => 'nullable|in:disponible,agotado,pausado',
        ]);

        if ($request->hasFile('image')) {
            $uploaded = Cloudinary::upload(
                $request->file('image')->getRealPath(),
                ['folder' => 'campodirecto/products']
            );
            $validated['image_url'] = $uploaded->getSecurePath();
        }

        $product->update($validated);

        return $this->success($product, 'Producto actualizado exitosamente');
    }

    public function destroy($id, Request $request)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->error('Producto no encontrado', 404);
        }

        if ($product->user_id !== $request->user()->id) {
            return $this->error('No tienes permiso para eliminar este producto', 403);
        }

        $product->delete();

        return $this->success(null, 'Producto eliminado exitosamente');
    }
}
