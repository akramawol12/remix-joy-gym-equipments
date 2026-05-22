import React, { useState } from "react";
import { Product, CartItem } from "./types";
import { JOY_CATALOG } from "./catalog";
import MovingProduct3D from "./components/MovingProduct3D";
import ProductOrbit3D from "./components/ProductOrbit3D";
import {
  Dumbbell,
  ShoppingCart,
  Sparkles,
  ChevronRight,
  Check,
  Star,
  Trash2,
  ShieldCheck,
  X,
  MapPin,
  RefreshCw,
  Sliders,
  BadgePercent
} from "lucide-react";

export default function App() {
  // Navigation locked to modern Premium Workshop
  const activeTab = "shop";

  // Interaction Modals & drawer states
  const [selectedProductFor3D, setSelectedProductFor3D] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");

  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [receiptCode, setReceiptCode] = useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    address: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: ""
  });

  // Unique key identifier generator
  const getCartItemKey = (item: CartItem): string => {
    return `${item.product.id}-${item.customMaterial || 'default'}-${item.customWeight || 'default'}`;
  };

  // Add customized/standard items into active basket
  const handleAddToCart = (product: Product, quantity: number, material: string, weight?: number) => {
    const newItem: CartItem = {
      product,
      quantity,
      customMaterial: material,
      customWeight: weight
    };

    const targetKey = getCartItemKey(newItem);

    setCart((prev) => {
      const existingIdx = prev.findIndex((it) => getCartItemKey(it) === targetKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, newItem];
    });

    // Auto open checkout sidebar for pleasant prompt feedback
    setIsCartOpen(true);
  };

  // Quick add helper used by layout designer & AI assistant
  const handleQuickAddProduct = (product: Product, material: string) => {
    handleAddToCart(product, 1, material, product.customizationOptions.weightSteps?.[0]);
  };

  const handleRemoveFromCart = (itemToRemove: CartItem) => {
    const targetKey = getCartItemKey(itemToRemove);
    setCart((prev) => prev.filter((it) => getCartItemKey(it) !== targetKey));
  };

  // Financial Sum Totals
  const cartSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const cartEstTax = Math.round(cartSubtotal * 0.08); // 8% tax
  const cartShipping = cartSubtotal > 1000 ? 0 : 150; // free delivery limit
  const cartTotalValue = cartSubtotal + cartEstTax + cartShipping;

  // Filter Catalog
  const filteredProducts = JOY_CATALOG.filter((p) => {
    if (activeCategoryFilter === "All") return true;
    return p.category === activeCategoryFilter;
  });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment transaction
    const randomHex = Math.random().toString(16).substr(2, 9).toUpperCase();
    setReceiptCode(`JOY-${randomHex}`);
  };

  const handleClearCartAndClose = () => {
    setCart([]);
    setReceiptCode(null);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  return (
    <div id="main_obsidian_root" className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#dcfc2d] selection:text-black relative overflow-x-hidden">
      
      {/* Sleek Ambient Lights */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#dcfc2d]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#dcfc2d]/5 blur-[140px] pointer-events-none z-0" />

      {/* Immersive Header and Launcher Area */}
      <header className="bg-black/90 border-b border-white/10 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#dcfc2d] rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(220,252,45,0.4)]">
              <Dumbbell className="text-black font-black" size={16} />
            </div>
            <div>
              <span className="font-display font-black text-white tracking-tighter uppercase italic text-[1.4rem] leading-none block">
                Joy Gym
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#dcfc2d] font-bold">
                Industrial Spec
              </span>
            </div>
          </div>

          {/* Desktop Nav Title Badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="px-4 py-1.5 bg-[#dcfc2d]/10 border border-[#dcfc2d]/35 text-[#dcfc2d] text-2xs uppercase tracking-[0.2em] font-mono font-black">
              ★ PREMIUM WORKSHOP WORKSPACE // EXCLUSIVE EDITION
            </span>
          </div>

          {/* Floating Action Cart Trigger */}
          <div className="flex items-center gap-4">
            <button
              id="floating_cart_trigger_btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-[#111] border border-white/10 text-white/80 hover:text-[#dcfc2d] hover:border-[#dcfc2d]/40 transition-all flex items-center gap-1"
              title="Open shop workspace cart"
            >
              <ShoppingCart size={16} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 bg-[#dcfc2d] text-black text-[10px] font-black flex items-center justify-center">
                  {cart.reduce((total, i) => total + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Visual Showcase segment */}
      <section className="relative overflow-hidden border-b border-white/10 pb-16 pt-20 md:py-28 flex items-center justify-center">
        {/* Background Image Layer with dark overlay protection */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-cover bg-center bg-no-repeat uppercase" style={{ backgroundImage: "url('/src/assets/images/joy_gym_hero_1779487240799.png')" }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-transparent to-black pointer-events-none" />

        {/* Background Italic Text for 3D Depth Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className="text-[15vw] md:text-[23vw] font-black text-white/[0.02] italic leading-none select-none uppercase tracking-tighter">
            FORGE
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-[#dcfc2d]/10 border border-[#dcfc2d]/30 px-3 py-1">
            <Sparkles size={11} className="text-[#dcfc2d]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#dcfc2d] font-bold">
              New Arrival // Future of Strength Engineering
            </span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-8xl italic uppercase tracking-tighter text-white max-w-5xl mx-auto leading-[0.85]">
            Level up <br className="hidden sm:inline" />
            Your <span className="text-[#dcfc2d] bg-radial-to-r from-neon-yellow to-yellow-400 drop-shadow-[0_0_20px_rgba(220,252,45,0.2)]">Power</span>
          </h1>

          <p className="font-sans text-xs sm:text-lg text-white/50 max-w-xl mx-auto leading-relaxed font-light">
            Premium architectural-grade gym equipment designed for elite performance and unmatched durability. Forge your legacy with JOY.
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              id="hero_action_planner"
              onClick={() => document.getElementById("premium_catalog")?.scrollIntoView({ behavior: "smooth" })}
              className="py-4 px-10 bg-[#dcfc2d] text-black font-black italic uppercase tracking-tight hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_20px_rgba(220,252,45,0.3)] flex items-center gap-2"
            >
              Explore Gear <ChevronRight size={14} className="stroke-[3]" />
            </button>
            <button
              id="hero_action_shop"
              onClick={() => document.getElementById("premium_catalog")?.scrollIntoView({ behavior: "smooth" })}
              className="py-4 px-10 border border-white/20 font-bold italic uppercase tracking-tight hover:bg-white/5 text-white transition"
            >
              View Specs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Sections Layout */}
      <main id="premium_catalog" className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-10 space-y-12 scroll-mt-24">
        
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 bg-[#dcfc2d] rounded-full animate-ping" />
                <span className="font-mono text-[10px] uppercase text-[#dcfc2d] tracking-[0.2em] font-bold">LIVE 3D INTERACTIVE GALLERY</span>
              </div>
              <h2 className="font-display font-black tracking-tighter text-white text-3xl uppercase italic">Joy Premium Catalog</h2>
              <p className="font-sans text-xs text-white/50 max-w-xl">
                Select from our modern & realistic elite gym equipments. Adjust materials or weights live by clicking Customize, or add directly to your industrial spec layout.
              </p>
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-sm border border-white/15 self-start md:self-auto">
              {["All", "Strength", "Cardio", "Accessories"].map((cat) => (
                <button
                  id={`filter_cat_${cat}`}
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-4 py-1.5 font-sans text-2xs font-bold uppercase tracking-wider rounded-xs transition ${
                    activeCategoryFilter === cat
                      ? "bg-[#dcfc2d] text-black italic font-black text-[11px]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                id={`catalog_product_card_${p.id}`}
                key={p.id}
                className="bg-[#0e0e0e] border border-white/10 rounded-xs overflow-hidden shadow-2xl hover:border-[#dcfc2d]/40 transition-all duration-300 p-4 shrink-0 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Moving 3D Interactive Canvas Representation */}
                  <div className="aspect-[4/3] bg-gradient-to-b from-neutral-900 to-black rounded-sm overflow-hidden relative border border-white/5">
                    <MovingProduct3D product={p} />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-xs bg-black/90 border border-white/10 backdrop-blur-md text-[9px] font-mono text-[#dcfc2d] font-bold z-10 transition-transform group-hover:scale-105">
                      {p.category} Series
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-sans font-black text-white text-md tracking-tight limit-line-title uppercase italic">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0 bg-black border border-white/10 px-2 py-0.5 rounded-none">
                      <Star size={11} className="text-[#dcfc2d] fill-[#dcfc2d]" />
                      <span className="font-mono text-[9px] text-[#dcfc2d] font-bold">{p.rating}</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-white/50 leading-relaxed min-h-[40px]">
                    {p.description}
                  </p>

                  {/* Short Technical Specs */}
                  <div className="py-2.5 border-t border-white/5">
                    <ul className="space-y-1.5">
                      {p.specifications.slice(0, 3).map((spec, idx) => (
                        <li key={idx} className="font-sans text-[10px] text-white/50 flex items-start gap-1.5 leading-relaxed">
                          <span className="h-1.5 w-1.5 bg-[#dcfc2d] rounded-full shrink-0 mt-1.5" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-[8px] text-white/45 uppercase tracking-widest font-black">Classification</span>
                    <span className="font-mono text-[10px] font-black text-[#dcfc2d] uppercase">Elite Spec</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`inspect_3d_btn_${p.id}`}
                      onClick={() => setSelectedProductFor3D(p)}
                      className="py-2 px-3 bg-black hover:bg-neutral-900 border border-white/10 text-white/85 hover:text-[#dcfc2d] font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-xs"
                      title="Interact with custom weight structures"
                    >
                      <Sliders size={12} /> Customize
                    </button>
                    <button
                      id={`quick_add_basket_${p.id}`}
                      onClick={() => handleQuickAddProduct(p, p.customizationOptions.materials[0])}
                      className="p-2.5 bg-[#dcfc2d]/10 border border-[#dcfc2d]/30 hover:bg-[#dcfc2d] text-[#dcfc2d] hover:text-black transition-all rounded-xs"
                      title="Add directly into configuration spec order"
                    >
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Cart Quick Drawer sidebar */}
      {isCartOpen && (
        <div id="cart_drawer_mask" className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-black border-l border-white/15 w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-[#dcfc2d]" size={16} />
                <h3 className="font-display font-black text-white text-md uppercase tracking-wider italic">
                  Industrial Studio Cart
                </h3>
              </div>
              <button
                id="close_cart_drawer_btn"
                onClick={() => setIsCartOpen(false)}
                className="p-1 px-3 bg-neutral-900 text-white/60 hover:text-white transition uppercase text-xs font-bold font-mono"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Cart body rows list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-24 space-y-3">
                  <ShoppingCart size={28} className="mx-auto text-white/20 animate-pulse" />
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">Cart Workspace Empty</h4>
                  <p className="font-sans text-[10px] text-white/40 max-w-[200px] mx-auto leading-normal">
                    Add standard items from the Premium Workshop or customized specs inside the 3D Studio planner.
                  </p>
                </div>
              ) : (
                cart.map((it, idx) => (
                  <div
                    id={`cart_row_item_${idx}`}
                    key={idx}
                    className="p-4 bg-[#0e0e0e] border border-white/10 flex items-start gap-4 justify-between rounded-none"
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <h4 className="font-sans font-black uppercase italic text-xs text-white leading-sm">{it.product.name}</h4>
                      <div className="space-y-1">
                        <span className="font-sans text-[9px] text-white/50 block">
                          Finish: <strong className="text-[#dcfc2d]">{it.customMaterial || 'Standard Nickel'}</strong>
                        </span>
                        {it.customWeight && (
                          <span className="font-mono text-[9px] text-[#dcfc2d] block bg-black px-1.5 py-0.5 border border-white/5 inline-block rounded-none font-bold">
                            Lvl: {it.customWeight} lbs selected
                          </span>
                        )}
                      </div>
                      <span className="font-sans text-[10px] text-white/40 block">Quantity: {it.quantity}</span>
                    </div>

                    <div className="text-right flex flex-col items-end justify-between h-full min-h-[60px]">
                      <span className="font-mono text-[9px] font-bold text-[#dcfc2d] uppercase tracking-wider bg-white/5 px-2 py-0.5">
                        Configured
                      </span>
                      <button
                        id={`delete_cart_row_${idx}`}
                        onClick={() => handleRemoveFromCart(it)}
                        className="text-red-400 hover:text-red-350 p-1 bg-black border border-white/10 rounded-none hover:bg-neutral-900 mt-2"
                        title="Remove specimen"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal blocks and active checkout panels */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-neutral-950/95 space-y-4 shadow-2xl">
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-white/50">
                    <span>Products Selected:</span>
                    <span className="font-mono text-white/85">{cart.reduce((sum, item) => sum + item.quantity, 0)} Units</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Precision Coating:</span>
                    <span className="font-mono text-white/85">Calibrated Grade</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Freight Truck Transport:</span>
                    <span className="font-mono text-[#dcfc2d] font-bold">COMPLIMENTARY</span>
                  </div>
                  <div className="flex justify-between items-baseline font-black uppercase text-white text-xs pt-3 border-t border-white/10">
                    <span>Configuration Spec:</span>
                    <span className="font-mono text-[#dcfc2d] text-xs">APPROVED // EXCLUSIVE</span>
                  </div>
                </div>

                {!isCheckoutOpen ? (
                  <button
                    id="trigger_checkout_form_btn"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-3.5 px-4 bg-[#dcfc2d] text-black font-sans text-xs font-black uppercase tracking-wider hover:bg-[#cbe625] transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    Proceed to Delivery <ChevronRight size={14} className="stroke-[3]" />
                  </button>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-3 border-t border-white/10">
                    <span className="block text-[9px] text-[#dcfc2d] uppercase tracking-[0.2em] font-black italic">
                      Secure Shipping Ledger
                    </span>

                    {/* Receipt code generation check */}
                    {receiptCode ? (
                      <div className="p-4 bg-black border border-[#dcfc2d] text-left space-y-3 font-mono animate-fade-in">
                        <div className="text-center pb-2 border-b border-dashed border-white/10">
                          <span className="text-[10px] text-[#dcfc2d] font-bold">JOY CUSTOMER RECEIPT</span>
                          <h4 className="text-xs text-white font-black uppercase italic mt-1">TRANSACTION CONFIRMED</h4>
                          <span className="text-[10px] text-white/60 font-bold block">{receiptCode}</span>
                        </div>
                        <div className="text-[10px] space-y-1 text-white/60">
                          <p>Customer: {checkoutForm.name || "Joy Athlete"}</p>
                          <p>Destination: {checkoutForm.address || "Main Gymnasium"}</p>
                          <p>Specs Registered: {cart.length} Custom Industrial Systems Approved</p>
                          <p>Delivering on Flatbed Freight Crane within 48 hours.</p>
                        </div>
                        <button
                          id="reset_order_cleared"
                          type="button"
                          onClick={handleClearCartAndClose}
                          className="w-full py-2 bg-[#dcfc2d]/10 border border-[#dcfc2d] text-[#dcfc2d] text-2xs hover:bg-[#dcfc2d] hover:text-black transition-colors text-center font-black uppercase tracking-wider"
                        >
                          Clear & Reset Workspace
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          id="checkout_name"
                          type="text"
                          required
                          placeholder="Recipient Full Name"
                          value={checkoutForm.name}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                          className="w-full bg-black border border-white/10 p-2.5 text-2xs text-white outline-none focus:border-[#dcfc2d] focus:ring-0 transition-colors"
                        />
                        <input
                          id="checkout_email"
                          type="email"
                          required
                          placeholder="Notifications Email Address"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                          className="w-full bg-black border border-white/10 p-2.5 text-2xs text-white outline-none focus:border-[#dcfc2d] focus:ring-0 transition-colors"
                        />
                        <input
                          id="checkout_address"
                          type="text"
                          required
                          placeholder="Flatbed Delivery Floor Address"
                          value={checkoutForm.address}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                          className="w-full bg-black border border-white/10 p-2.5 text-2xs text-white outline-none focus:border-[#dcfc2d] focus:ring-0 transition-colors"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            id="checkout_card"
                            type="text"
                            required
                            placeholder="Cart Token (16-digit)"
                            maxLength={16}
                            value={checkoutForm.cardNumber}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, cardNumber: e.target.value })}
                            className="col-span-2 w-full bg-black border border-white/10 p-2.5 text-2xs text-white outline-none focus:border-[#dcfc2d] focus:ring-0 transition-colors"
                          />
                          <input
                            id="checkout_cvv"
                            type="text"
                            required
                            placeholder="CVV"
                            maxLength={3}
                            value={checkoutForm.cardCvv}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, cardCvv: e.target.value })}
                            className="w-full bg-black border border-white/10 p-2.5 text-2xs text-white outline-none focus:border-[#dcfc2d] focus:ring-0 transition-colors"
                          />
                        </div>

                        <div className="flex gap-1.5 pt-2">
                          <button
                            id="cancel_checkout_back_to_cart"
                            type="button"
                            onClick={() => setIsCheckoutOpen(false)}
                            className="flex-1 py-2 bg-black border border-white/10 text-white/50 text-2xs font-extrabold uppercase transition hover:text-white"
                          >
                            Back to spec
                          </button>
                          <button
                            id="submit_checkout_receipt_order"
                            type="submit"
                            className="flex-1 py-2 bg-[#dcfc2d] text-black hover:bg-[#cbe625] text-2xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1"
                          >
                            Sign Receipt
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Orbit interactive customizer rendering */}
      {selectedProductFor3D && (
        <ProductOrbit3D
          product={selectedProductFor3D}
          onAddToCart={handleAddToCart}
          onClose={() => setSelectedProductFor3D(null)}
        />
      )}

      {/* Bottom Feature Bar from Design Theme */}
      <section className="bg-[#111111] grid grid-cols-1 md:grid-cols-4 border-t border-white/10 mt-16 max-w-7xl mx-auto w-full">
        <div className="border-r border-white/5 p-8 flex flex-col justify-between hover:bg-white/[0.02] cursor-default space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#dcfc2d]">01 // Stability</span>
          <p className="text-xs text-white/60 leading-relaxed italic">Reinforced steel frame for 100% vibration absorption.</p>
        </div>
        <div className="border-r border-white/5 p-8 flex flex-col justify-between hover:bg-white/[0.02] cursor-default space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#dcfc2d]">02 // Ergonomics</span>
          <p className="text-xs text-white/60 leading-relaxed italic">Biomechanically tested seats for maximum spine support.</p>
        </div>
        <div className="border-r border-white/5 p-8 flex flex-col justify-between hover:bg-white/[0.02] cursor-default space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#dcfc2d]">03 // Smart Tech</span>
          <p className="text-xs text-white/60 leading-relaxed italic">Real-time reps and power output tracking via CloudJOY.</p>
        </div>
        <div className="p-8 flex flex-col justify-between hover:bg-white/[0.02] cursor-default space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#dcfc2d]">04 // Delivery</span>
          <p className="text-xs text-white/60 leading-relaxed italic">Global white-glove setup and lifetime warranty.</p>
        </div>
      </section>

      {/* Modern minimal aesthetic Status Bar Footer */}
      <footer className="border-t border-white/10 py-10 px-4 mt-0 bg-black/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-white font-display font-black text-sm uppercase italic">
              <div className="h-4 w-4 bg-[#dcfc2d] flex items-center justify-center mr-1">
                <Dumbbell size={10} className="text-black" />
              </div> 
              Joy Gym Equipments
            </div>
            <p className="font-sans text-[10px] text-white/40 leading-normal max-w-sm">
              Constructing elite grade athletic systems. Fabricated on request in deep-iron CNC workshops to guarantee structural resilience.
            </p>
          </div>

          <div className="flex flex-col md:flex-end text-center md:text-right font-mono text-[9px] text-white/30 gap-1.5">
            <span className="flex items-center justify-center md:justify-end gap-1.5">
              <MapPin size={10} className="text-[#dcfc2d]" /> 100 Forge Avenue, Iron Works District
            </span>
            <span>Local Sync Time: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
            <span className="text-[#dcfc2d]/70 uppercase tracking-widest font-extrabold text-[10px]">
              Crafting Athletic Dominance
            </span>
          </div>
        </div>

        {/* Precise Design Theme Status Bar Segment */}
        <div className="max-w-7xl mx-auto pt-6 flex justify-between items-center text-[10px] font-bold tracking-[0.25em] uppercase text-white/20">
          <div>Est. 1998 // Joy Gym Equips</div>
          <div className="hidden sm:flex gap-6 text-[9px]">
            <span className="hover:text-white/60 transition-colors cursor-pointer">Instagram</span>
            <span className="hover:text-white/60 transition-colors cursor-pointer">Behance</span>
            <span className="hover:text-white/60 transition-colors cursor-pointer">X-Corp</span>
          </div>
          <div>Berlin • Tokyo • New York</div>
        </div>
      </footer>
    </div>
  );
}
