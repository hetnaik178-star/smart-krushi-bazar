const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const createProduct = async (req, res) => {
  try {
    let imageUrl = req.body.image || 'https://via.placeholder.com/300?text=No+Image';
    
    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'smart_krushi_bazar',
            resource_type: 'auto'
          });
          imageUrl = result.secure_url;
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (cErr) {
          console.warn('⚠️ Cloudinary upload warning, using local image file fallback:', cErr.message);
          imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
      } else {
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
    }

    const product = await Product.create({ 
      ...req.body, 
      image: imageUrl, 
      farmerId: req.user._id 
    });
    
    res.status(201).json(product);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, sort, page = 1, limit = 8 } = req.query;
    let query = { isActive: true };
    
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'qty_desc') sortOption = { quantity: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('farmerId', 'name location profileImage')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmerId', 'name location profileImage bio farmName specialization role createdAt');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let updateData = { ...req.body };

    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, { folder: 'smart_krushi_bazar' });
          updateData.image = result.secure_url;
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (cErr) {
          updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
      } else {
        updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user._id, isActive: { $ne: false } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your products', error: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getMyProducts };
