const router = require("express").Router()
const { celebrate } = require("celebrate")
const ObjectId = require("mongoose").Types.ObjectId

const Cart = require("../models/Cart.model")
const { cart: cartSchema } = require('../models/schema')
const { 
	verifyToken,
	verifyAuthorization,
	verifyAdminAccess,
} = require('../middlewares/verifyAuth')


router.get("/", verifyAdminAccess, async (req, res) => {
	try {
		const carts = await Cart.find()
		return res.json(carts)

	} catch (err) {
		console.error(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

router.post("/", 
	verifyToken, 
	celebrate({ body: cartSchema.new }),
	async (req, res) => {
	const { products } = req.body

	try {
		await Cart.create({ 
			userID: ObjectId(req.user.uid),
			products,
		})
		return res.json(cartResponse.cartCreated)

	} catch (err) {
		console.log(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

router.post("/clear", verifyToken, async (req, res) => {
	try {
		await Cart.updateOne(
			{userID: ObjectId(req.user.uid)},
			{$set: {products: []}},
		)
		return res.json(cartResponse.cartCleared)

	} catch (err) {
		console.log(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

router.get("/:id", verifyAuthorization, async (req, res) => {
	try {
		let cart = await Cart.findOne({ userID: ObjectId(req.params.id) })
		if (cart) {
			cart = await cart.populate({
				path: 'products.productID',
				select: ['title','price','image']
			})
		}
		return res.json(cart)

	} catch (err) {
		console.error(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

router.put("/:id", 
	verifyAuthorization, 
	celebrate({ body: cartSchema.update }),
	async (req, res) => {
	const { products } = req.body

	try {
		await Cart.updateOne(
			{userID: ObjectId(req.params.id)},
			{$push: { products }},
			{new: true},
		)
		return res.json(cartResponse.cartUpdated)
		
	} catch (err) {
		console.error(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

router.patch("/:id",
	verifyAuthorization,
	celebrate({ body: cartSchema.patch }),
	async (req, res) => {
	const { productID, quantity } = req.body

	try {
		if (quantity === 0) {
			await Cart.updateOne(
				{userID: ObjectId(req.params.id)},
				{'$pull': {products: {productID: ObjectId(productID)}}}
			)
		} else {
			await Cart.updateOne(
				{userID: ObjectId(req.params.id), 'products.productID': ObjectId(productID)},
				{'$set': {'products.$.quantity': quantity}}
			)
		}
		return res.json(cartResponse.cartPatched)

	} catch (err) {
		console.error(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

router.delete("/:id", verifyAuthorization, async (req, res) => {
	try {
		await Cart.deleteOne({ userID: ObjectId(req.params.id) })
		res.json(cartResponse.cartDeleted)

	} catch (err) {
		console.log(err)
		return res.status(500).json(cartResponse.unexpectedError)
	}
})

const cartResponse = {
	cartCreated: { 
		status: "ok",
		message: "cart has been created",
	},	
	cartCleared: { 
		status: "ok",
		message: "cart has been cleared",
	},	
	cartUpdated: { 
		status: "ok",
		message: "cart has been updated",
	},
	cartPatched: {
		status: "ok",
		message: "cart has been patched",
	},
	cartDeleted: { 
		status: "ok",
		message: "cart has been deleted",
	},
	unexpectedError: {
		status: "error",
		message: "an unexpected error occurred",
	},
}

module.exports = router