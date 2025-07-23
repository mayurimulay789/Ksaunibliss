const User = require("../models/User");
const Product = require("../models/Product");

// 🛒 Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: "cart.product",
      select: "name price originalPrice images stock sizes colors isActive",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter active products and calculate totals
    const activeCartItems = user.cart.filter(
      (item) => item.product && item.product.isActive
    );

    let subtotal = 0;
    let totalItems = 0;

    const cartItems = activeCartItems.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      return {
        _id: item._id,
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          images: item.product.images,
          stock: item.product.stock,
          sizes: item.product.sizes,
          colors: item.product.colors,
        },
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        addedAt: item.addedAt,
        itemTotal,
      };
    });

    // Remove inactive items if any
    if (activeCartItems.length !== user.cart.length) {
      user.cart = activeCartItems;
      await user.save();
    }

    res.status(200).json({
      success: true,
      cart: {
        items: cartItems,
        summary: {
          totalItems,
          subtotal,
          shipping: subtotal > 999 ? 0 : 99,
          total: subtotal + (subtotal > 999 ? 0 : 99),
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// 🛒 Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 10",
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    if (size && product.sizes.length > 0) {
      const availableSizes = product.sizes.map((s) => s.size);
      if (!availableSizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Selected size is not available",
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;

      if (newQuantity > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 items allowed per product",
        });
      }

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        size,
        color,
      });
    }

    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name price originalPrice images stock sizes colors",
    });

    const addedItem = user.cart.find(
      (item) =>
        item.product &&
        item.product._id.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (!addedItem || !addedItem.product) {
      return res.status(500).json({
        success: false,
        message: "Failed to populate added item details",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartItem: {
        _id: addedItem._id,
        product: addedItem.product,
        quantity: addedItem.quantity,
        size: addedItem.size,
        color: addedItem.color,
        addedAt: addedItem.addedAt,
      },
      cartCount: user.cart.reduce((total, item) => total + item.quantity, 0),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

// 🛒 Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;

    if (quantity && (quantity < 1 || quantity > 10)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 10",
      });
    }

    const user = await User.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const cartItem = user.cart[cartItemIndex];
    const product = cartItem.product;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this cart item",
      });
    }

    if (quantity && quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    if (size && product.sizes.length > 0) {
      const availableSizes = product.sizes.map((s) => s.size);
      if (!availableSizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Selected size is not available",
        });
      }
    }

    if (quantity !== undefined) cartItem.quantity = quantity;
    if (size !== undefined) cartItem.size = size;
    if (color !== undefined) cartItem.color = color;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cartItem: {
        _id: cartItem._id,
        product: cartItem.product,
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

// 🗑️ Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cartCount: user.cart.reduce((total, item) => total + item.quantity, 0),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

// 🗑️ Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
