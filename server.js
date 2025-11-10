import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config(); // .env faylını yükləyir

const app = express();
app.use(helmet());
app.use(express.json());

// ---------- CONFIG ----------
const FRONTEND_URL = '*'; // CORS üçün
app.use(cors({ origin: FRONTEND_URL }));

const PORT = process.env.PORT || 3000;

// Sabit NFT və Proxy kontrakt ünvanları
const NFT_CONTRACT_ADDRESS = "0x54a88333F6e7540eA982261301309048aC431eD5";
const PROXY_CONTRACT_ADDRESS = "0x9656448941C76B79A39BC4ad68f6fb9F01181EC7";

// MongoDB bağlantısı
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kamoazmiu:MyStrongPass123@kamoazmiu.rooymnz.mongodb.net/KamoAzmiuDB?appName=KamoAzmiu';

// ---------- MONGODB SETUP ----------
try {
  await mongoose.connect(MONGO_URI); // Warning-ları yaradan opsiyalar silindi
  console.log('✅ MongoDB qoşuldu');
} catch (err) {
  console.error('❌ MongoDB qoşulma xətası:', err);
  process.exit(1);
}

// ---------- SCHEMA ----------
const orderSchema = new mongoose.Schema({
  id: { type: String, default: () => nanoid(), unique: true },
  tokenId: { type: String, required: true },
  price: { type: Number, required: true },

  // Sabit kontrakt ünvanları
  nftContract: { type: String, default: NFT_CONTRACT_ADDRESS },
  marketplaceContract: { type: String, default: PROXY_CONTRACT_ADDRESS },

  seller: { type: String, required: true },
  seaportOrder: { type: Object, required: true },
  orderHash: { type: String, default: null },
  onChain: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// ---------- POST /order ----------
app.post('/order', async (req, res) => {
  try {
    const { tokenId, price, sellerAddress, seaportOrder, orderHash } = req.body;

    if (!tokenId || !price || !sellerAddress || !seaportOrder)
      return res.status(400).json({ success: false, error: 'Missing parameters' });

    const order = await Order.create({
      tokenId: tokenId.toString(),
      price,
      nftContract: NFT_CONTRACT_ADDRESS,
      marketplaceContract: PROXY_CONTRACT_ADDRESS,
      seller: sellerAddress.toLowerCase(),
      seaportOrder,
      orderHash: orderHash || null,
      onChain: !!orderHash,
    });

    res.json({ success: true, order });
  } catch (e) {
    console.error('POST /order error', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ---------- GET /orders/:address? ----------
app.get('/orders/:address?', async (req, res) => {
  try {
    const addr = req.params.address;
    const query = addr ? { seller: addr.toLowerCase() } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    console.error('GET /orders error', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ---------- SERVER START ----------
app.listen(PORT, () => console.log(`🚀 Backend ${PORT}-də işləyir`));