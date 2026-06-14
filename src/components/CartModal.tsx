import { X, ShoppingCart, Plus, Minus, Trash2, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  removeFromCart: (productId: string) => void;
  deleteFromCartCompletely: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToCart: (product: any) => void;
  name: string;
  setName: (name: string) => void;
  wa: string;
  setWa: (wa: string) => void;
  address: string;
  setAddress: (address: string) => void;
  shippingMethod: string;
  setShippingMethod: (shippingMethod: string) => void;
  paymentMethod: string;
  setPaymentMethod: (paymentMethod: string) => void;
}

export default function CartModal({ 
  isOpen, 
  onClose, 
  cart, 
  removeFromCart, 
  deleteFromCartCompletely, 
  updateCartQuantity,
  addToCart, 
  name, 
  setName, 
  wa, 
  setWa, 
  address, 
  setAddress,
  shippingMethod,
  setShippingMethod,
  paymentMethod,
  setPaymentMethod
}: CartModalProps) {
  const getItemPriceInfo = (item: CartItem) => {
    const p = item.product;
    const qty = item.quantity;
    const hasBulk = typeof p.bulkQuantity === 'number' && p.bulkQuantity > 0 && typeof p.bulkPrice === 'number' && p.bulkPrice > 0;
    const isBulkActive = hasBulk && qty >= p.bulkQuantity!;
    
    const basePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
    const activePrice = isBulkActive ? p.bulkPrice! : basePrice;
    const subtotal = activePrice * qty;
    
    return {
      hasBulk,
      isBulkActive,
      basePrice,
      activePrice,
      subtotal,
      bulkQuantity: p.bulkQuantity || 0,
      bulkPrice: p.bulkPrice || 0
    };
  };

  const formatWhatsAppLink = () => {
    const isPickup = shippingMethod === 'Ambil Ditempat';
    
    let totalCartAmount = 0;
    const itemsFormatted = cart.map(item => {
      const { isBulkActive, activePrice, subtotal } = getItemPriceInfo(item);
      totalCartAmount += subtotal;
      
      const bulkTag = isBulkActive ? " (Harga Grosir)" : "";
      return `- ${item.product.name} (${item.quantity} x Rp ${activePrice.toLocaleString('id-ID')} = Rp. ${subtotal.toLocaleString('id-ID')})${bulkTag}`;
    }).join('\n');

    const totalAmountFormatted = totalCartAmount.toLocaleString('id-ID');

    let message = `Halo, saya ingin memesan:\n${itemsFormatted}\n\n`;
    message += `Total: RP ${totalAmountFormatted}\n\n`;
    message += `Data Pemesan:\n`;
    message += `Nama: ${name}\n`;
    message += `WA: ${wa}\n\n`;

    if (isPickup) {
      message += `Metode Pengiriman: Ambil Di Tempat\n`;
      message += `Saya Akan Segera Ke LOKASI GUDANG Di :\n`;
      message += `Jl Ronggowarsito GG Merpati RT23 RW 05 Ketanggi Ngawi Jawa Timur 63211\n`;
      message += `https://maps.app.goo.gl/jysbVYHMZjTaKBKi9\n\n`;
    } else {
      message += `Metode Pengiriman: Delivery Order\n`;
      message += `LOKASI Pengiriman :\n`;
      message += `${address}\n\n`;
    }

    message += `Metode Pembayaran: ${paymentMethod}`;

    return `https://wa.me/6285859407008?text=${encodeURIComponent(message)}`;
  };

  const isFormValid = name && wa && (shippingMethod === 'Ambil Ditempat' || address) && cart.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Keranjang Belanja</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X /></button>
        </div>
        {cart.length === 0 ? <p className="text-center text-gray-500 py-6">Keranjang belanja Anda kosong.</p> : (
          <>
            <ul className="space-y-4 mb-6">
              {cart.map((item) => {
                const { hasBulk, isBulkActive, basePrice, activePrice, subtotal, bulkQuantity, bulkPrice } = getItemPriceInfo(item);
                return (
                  <li key={item.product.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                    {/* Product Preview Thumbnail & Details */}
                    <div className="flex items-center gap-4 flex-grow">
                      <img 
                        src={item.product.imageUrl || 'https://via.placeholder.com/150'} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm flex-shrink-0 bg-gray-50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col flex-grow">
                        <span className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{item.product.name}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {isBulkActive ? (
                            <>
                              <span className="text-xs text-gray-400 line-through">
                                RP {basePrice.toLocaleString('id-ID')}
                              </span>
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                Grosir: RP {activePrice.toLocaleString('id-ID')} / {item.product.unit}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-500">
                              RP {basePrice.toLocaleString('id-ID')} / {item.product.unit}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-xs font-bold text-orange-600 mt-1">
                          Subtotal: RP {subtotal.toLocaleString('id-ID')}
                        </span>

                        {/* Bulk pricing hint */}
                        {hasBulk && !isBulkActive && (
                          <span className="text-[11px] text-orange-600/90 mt-1 bg-orange-50/70 px-2 py-1 rounded-lg border border-orange-100/80 leading-relaxed">
                            💡 Tambah {(bulkQuantity - item.quantity).toFixed(2).replace(/\.00$/, '')} {item.product.unit} lagi untuk mendapatkan otomatis Harga Grosir <strong className="text-orange-700">RP {bulkPrice.toLocaleString('id-ID')}/{item.product.unit}</strong>!
                          </span>
                        )}
                        {hasBulk && isBulkActive && (
                          <span className="text-[11px] text-green-700 mt-1 bg-green-50 px-2 py-1 rounded-lg border border-green-100 font-medium leading-relaxed">
                            🎉 Selamat! Harga Grosir Otomatis Aktif (Min. {bulkQuantity} {item.product.unit})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Deletion */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      {/* Manual Editable input */}
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-xl border border-gray-200">
                        <button 
                          onClick={() => removeFromCart(item.product.id)} 
                          className="text-gray-500 hover:text-red-500 p-1 rounded hover:bg-gray-200 transition"
                          title="Kurangi jumlah"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number" 
                          step="any"
                          min="0.01"
                          value={item.quantity === 0 ? '' : item.quantity} 
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              updateCartQuantity(item.product.id, val);
                            } else {
                              updateCartQuantity(item.product.id, 0);
                            }
                          }} 
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val) || val <= 0) {
                              updateCartQuantity(item.product.id, 1);
                            }
                          }}
                          className="w-14 text-center font-bold text-sm text-gray-800 focus:outline-none bg-transparent"
                          placeholder="0"
                          title="Tulis jumlah kuantitas"
                        />
                        <button 
                          onClick={() => addToCart(item.product)} 
                          className="text-gray-500 hover:text-green-500 p-1 rounded hover:bg-gray-200 transition"
                          title="Tambah jumlah"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Hapus Produk completely */}
                      <button 
                        onClick={() => deleteFromCartCompletely(item.product.id)} 
                        className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                        title="Hapus Produk"
                        id={`btn-delete-cart-${item.product.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-xl font-bold mb-6 text-right">Total: <span className="text-orange-600">RP {cart.reduce((sum, item) => sum + getItemPriceInfo(item).subtotal, 0).toLocaleString('id-ID')}</span></p>
            
            <div className="space-y-4 mb-6 border-t pt-4">
              <h4 className="font-bold text-gray-800 text-lg mb-2">Data Pemesanan</h4>
              
              {/* Nama Lengkap */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  placeholder="Nama Lengkap Anda" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none" 
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nomor WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="Misal: 081234567890" 
                  value={wa} 
                  onChange={e => setWa(e.target.value)} 
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none" 
                />
              </div>

              {/* Metode Pengiriman: Ambil di Tempat / Delivery Order */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Metode Pengiriman</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('Delivery')}
                    className={`py-2 px-4 rounded-lg font-semibold text-sm transition ${shippingMethod === 'Delivery' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Delivery Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingMethod('Ambil Ditempat')}
                    className={`py-2 px-4 rounded-lg font-semibold text-sm transition ${shippingMethod === 'Ambil Ditempat' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Ambil Di Tempat
                  </button>
                </div>
              </div>

              {/* Alamat Input / Warehouse Info based on Shipping Method */}
              {shippingMethod === 'Ambil Ditempat' ? (
                <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-4 flex gap-3 text-orange-900">
                  <MapPin size={24} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-orange-800 mb-1">Alamat Gudang Kami:</p>
                    <p className="text-gray-600 font-medium leading-relaxed mb-2">
                      Jl Ronggowarsito GG Merpati RT23 RW 05 Ketanggi Ngawi Jawa Timur 63211
                    </p>
                    <a 
                      href="https://maps.app.goo.gl/jysbVYHMZjTaKBKi9" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-orange-600 font-bold hover:underline bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-xs transition"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Alamat Pengiriman</label>
                  <textarea 
                    placeholder="Masukkan alamat pengiriman lengkap Anda" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none h-20"
                  ></textarea>
                </div>
              )}

              {/* Metode Pembayaran */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Metode Pembayaran</label>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)} 
                  className="w-full p-3 border rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none font-semibold text-gray-700"
                  id="select-payment-method"
                >
                  <option value="Cash / Bayar di Tempat">Cash / Bayar di Tempat (COD)</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Titip Sopir">Titip Sopir</option>
                </select>
              </div>
            </div>
            
            <a 
              href={isFormValid ? formatWhatsAppLink() : "#"}
              target={isFormValid ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${isFormValid ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <ShoppingCart size={20} />
              Checkout via WhatsApp
            </a>
            {!isFormValid && <p className="text-red-500 text-sm mt-2 text-center">Silakan lengkapi data pemesanan.</p>}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
