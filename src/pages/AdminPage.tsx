import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
   fetchMyChannels,
   fetchRestaurants,
   linkChannelToTelegram,
   unlinkChannel,
   fetchDishes,
   createDish,
   updateDish,
   updateStock,
   updateStoreDescription,
} from "../api";
import type { CreateDishInput, UpdateDishInput } from "../types";
import { useAdminStore } from "../store/adminStore";
import PageHeader from "../components/PageHeader";

const AdminPage: FC = () => {
   const navigate = useNavigate();

   const { role, myChannels, checkAdminStatus } = useAdminStore();

   const [activeTab, setActiveTab] = useState<"products" | "inventory" | "store">("products");
   const [selectedChannelId, setSelectedChannelId] = useState<string>("");
   const [editMode, setEditMode] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [linkTelegramId, setLinkTelegramId] = useState("");
   const [newDish, setNewDish] = useState<Partial<CreateDishInput>>({});
   const [editDish, setEditDish] = useState<Partial<UpdateDishInput>>({});
   const [stockUpdate, setStockUpdate] = useState<Record<string, number>>({});
   const [storeDescription, setStoreDescription] = useState("");

   useEffect(() => {
      checkAdminStatus();
   }, [checkAdminStatus]);

   useEffect(() => {
      if (myChannels.length > 0 && !selectedChannelId) {
         setSelectedChannelId(myChannels[0].id);
      }
   }, [myChannels, selectedChannelId]);

   const { data: restaurants } = useQuery({
      queryKey: ["restaurants"],
      queryFn: fetchRestaurants,
      enabled: role === "superadmin",
   });

   const { data: adminChannels } = useQuery({
      queryKey: ["myChannels"],
      queryFn: fetchMyChannels,
      enabled: role !== "none",
   });

   const { data: dishes, refetch: refetchDishes } = useQuery({
      queryKey: ["adminDishes", selectedChannelId],
      queryFn: () => fetchDishes(selectedChannelId, selectedChannelId),
      enabled: !!selectedChannelId && role === "channel-admin",
   });

   const handleLinkChannel = async () => {
      if (!linkTelegramId || !selectedChannelId) return;
      setIsSubmitting(true);
      setError(null);
      try {
         await linkChannelToTelegram({
            restaurantId: selectedChannelId,
            telegramUserId: linkTelegramId,
         });
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      } catch (e) {
         setError((e as Error).message);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleUnlinkChannel = async (restaurantId: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
         await unlinkChannel(restaurantId);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      } catch (e) {
         setError((e as Error).message);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleCreateDish = async () => {
      if (!selectedChannelId || !newDish.name || !newDish.price) return;
      setIsSubmitting(true);
      setError(null);
      try {
         await createDish({
            name: newDish.name,
            description: newDish.description || "",
            price: newDish.price,
            currency: newDish.currency || "USD",
            categoryId: selectedChannelId,
            restaurantId: selectedChannelId,
            imageUrl: newDish.imageUrl,
         });
         setNewDish({});
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
         refetchDishes();
      } catch (e) {
         setError((e as Error).message);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleUpdateDish = async () => {
      if (!editDish.dishId || !selectedChannelId) return;
      setIsSubmitting(true);
      setError(null);
      try {
         const input: UpdateDishInput = {
            dishId: editDish.dishId,
            name: editDish.name,
            description: editDish.description,
            price: editDish.price,
            currency: editDish.currency,
            restaurantId: selectedChannelId,
         };
         await updateDish(input);
         setEditMode(null);
         setEditDish({});
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
         refetchDishes();
      } catch (e) {
         setError((e as Error).message);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleUpdateStock = async (dishId: string) => {
      const quantity = stockUpdate[dishId];
      if (quantity === undefined || !selectedChannelId) return;
      setIsSubmitting(true);
      setError(null);
      try {
         await updateStock({
            dishId,
            quantity,
            restaurantId: selectedChannelId,
         });
         setStockUpdate({});
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
         refetchDishes();
      } catch (e) {
         setError((e as Error).message);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleUpdateDescription = async () => {
      if (!selectedChannelId || !storeDescription) return;
      setIsSubmitting(true);
      setError(null);
      try {
         await updateStoreDescription({
            restaurantId: selectedChannelId,
            description: storeDescription,
         });
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      } catch (e) {
         setError((e as Error).message);
         window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      } finally {
         setIsSubmitting(false);
      }
   };

   if (role === "none") {
      return (
         <div className="page">
            <PageHeader title="Admin Panel" showBack onBack={() => navigate(-1)} />
            <div className="page-content flex items-center justify-center">
               <div className="text-center p-8">
                  <div className="text-4xl mb-4">🚫</div>
                  <p className="text-lg font-medium">No Access</p>
                  <p
                     className="text-sm mt-2"
                     style={{ color: "var(--tg-theme-hint-color)" }}
                  >
                     You are not an admin for any channel.
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="page">
         <PageHeader title="Admin Panel" showBack onBack={() => navigate(-1)} />
         <div
            className="page-content"
            style={{
               paddingTop: "calc(60px + env(safe-area-inset-top))",
               paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            }}
         >
            {error && (
               <div
                  className="m-4 p-3 rounded-lg text-sm"
                  style={{
                     backgroundColor: "var(--tg-theme-destructive-text-color)",
                     color: "var(--tg-theme-button-text-color)",
                  }}
               >
                  {error}
               </div>
            )}

            {role === "superadmin" && (
               <div className="p-4 space-y-4">
                  <h2
                     className="text-lg font-semibold"
                     style={{ color: "var(--tg-theme-text-color)" }}
                  >
                     Superadmin
                  </h2>
                  <p style={{ color: "var(--tg-theme-hint-color)" }}>
                     Link Telegram users to channels.
                  </p>

                  <div className="space-y-2">
                     <label className="text-sm font-medium">Select Channel</label>
                     <select
                        value={selectedChannelId}
                        onChange={(e) => setSelectedChannelId(e.target.value)}
                        className="w-full p-3 rounded-lg border"
                        style={{
                           backgroundColor: "var(--tg-theme-secondary-bg-color)",
                           color: "var(--tg-theme-text-color)",
                           borderColor: "var(--tg-theme-hint-color)",
                        }}
                     >
                        <option value="">Select restaurant</option>
                        {restaurants?.map((r) => (
                           <option key={r.id} value={r.id}>
                              {r.name}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium">Telegram User ID</label>
                     <input
                        type="text"
                        value={linkTelegramId}
                        onChange={(e) => setLinkTelegramId(e.target.value)}
                        placeholder="Enter Telegram ID"
                        className="w-full p-3 rounded-lg border"
                        style={{
                           backgroundColor: "var(--tg-theme-secondary-bg-color)",
                           color: "var(--tg-theme-text-color)",
                           borderColor: "var(--tg-theme-hint-color)",
                        }}
                     />
                  </div>

                  <div className="flex gap-2">
                     <button
                        onClick={handleLinkChannel}
                        disabled={isSubmitting}
                        className="tg-btn flex-1"
                     >
                        {isSubmitting ? "Linking..." : "Link Channel"}
                     </button>
                  </div>

                  <div
                     className="pt-4 border-t"
                     style={{ borderColor: "var(--tg-theme-hint-color)" }}
                  >
                     <h3
                        className="text-md font-semibold mb-3"
                        style={{ color: "var(--tg-theme-text-color)" }}
                     >
                        Linked Channels
                     </h3>
                     {adminChannels
                        ?.filter((c) => c.hasAdmin)
                        .map((channel) => (
                           <div
                              key={channel.id}
                              className="flex items-center justify-between p-3 rounded-lg mb-2"
                              style={{
                                 backgroundColor:
                                    "var(--tg-theme-secondary-bg-color)",
                              }}
                           >
                              <div>
                                 <p className="font-medium">{channel.name}</p>
                                 {channel.description && (
                                    <p
                                       className="text-sm"
                                       style={{
                                          color: "var(--tg-theme-hint-color)",
                                       }}
                                    >
                                       {channel.description}
                                    </p>
                                 )}
                              </div>
                              <button
                                 onClick={() => handleUnlinkChannel(channel.id)}
                                 disabled={isSubmitting}
                                 className="text-sm px-3 py-1 rounded"
                                 style={{
                                    color: "var(--tg-theme-destructive-text-color)",
                                 }}
                              >
                                 Unlink
                              </button>
                           </div>
                        ))}
                  </div>
               </div>
            )}

            {role === "channel-admin" && (
               <div className="flex flex-col h-full">
                  <div
                     className="p-3 border-b"
                     style={{ borderColor: "var(--tg-theme-hint-color)" }}
                  >
                     <select
                        value={selectedChannelId}
                        onChange={(e) => setSelectedChannelId(e.target.value)}
                        className="w-full p-2 rounded-lg"
                        style={{
                           backgroundColor: "var(--tg-theme-secondary-bg-color)",
                           color: "var(--tg-theme-text-color)",
                        }}
                     >
                        {myChannels.map((channel) => (
                           <option key={channel.id} value={channel.id}>
                              {channel.name}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div
                     className="flex border-b"
                     style={{ borderColor: "var(--tg-theme-hint-color)" }}
                  >
                     <button
                        onClick={() => setActiveTab("products")}
                        className={`flex-1 py-3 text-sm font-medium ${
                           activeTab === "products" ? "border-b-2" : ""
                        }`}
                        style={{
                           borderColor:
                              activeTab === "products"
                                 ? "var(--tg-theme-button-color)"
                                 : "transparent",
                           color:
                              activeTab === "products"
                                 ? "var(--tg-theme-button-color)"
                                 : "var(--tg-theme-hint-color)",
                        }}
                     >
                        Products
                     </button>
                     <button
                        onClick={() => setActiveTab("inventory")}
                        className={`flex-1 py-3 text-sm font-medium ${
                           activeTab === "inventory" ? "border-b-2" : ""
                        }`}
                        style={{
                           borderColor:
                              activeTab === "inventory"
                                 ? "var(--tg-theme-button-color)"
                                 : "transparent",
                           color:
                              activeTab === "inventory"
                                 ? "var(--tg-theme-button-color)"
                                 : "var(--tg-theme-hint-color)",
                        }}
                     >
                        Inventory
                     </button>
                     <button
                        onClick={() => setActiveTab("store")}
                        className={`flex-1 py-3 text-sm font-medium ${
                           activeTab === "store" ? "border-b-2" : ""
                        }`}
                        style={{
                           borderColor:
                              activeTab === "store"
                                 ? "var(--tg-theme-button-color)"
                                 : "transparent",
                           color:
                              activeTab === "store"
                                 ? "var(--tg-theme-button-color)"
                                 : "var(--tg-theme-hint-color)",
                        }}
                     >
                        Store
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                     {activeTab === "products" && (
                        <div className="space-y-4">
                           <div
                              className="p-4 rounded-lg space-y-3"
                              style={{
                                 backgroundColor:
                                    "var(--tg-theme-secondary-bg-color)",
                              }}
                           >
                              <h3 className="font-semibold">Add Product</h3>
                              <input
                                 type="text"
                                 value={newDish.name || ""}
                                 onChange={(e) =>
                                    setNewDish({ ...newDish, name: e.target.value })
                                 }
                                 placeholder="Product name"
                                 className="w-full p-2 rounded border"
                                 style={{
                                    backgroundColor: "var(--tg-theme-bg-color)",
                                    color: "var(--tg-theme-text-color)",
                                 }}
                              />
                              <textarea
                                 value={newDish.description || ""}
                                 onChange={(e) =>
                                    setNewDish({
                                       ...newDish,
                                       description: e.target.value,
                                    })
                                 }
                                 placeholder="Description"
                                 className="w-full p-2 rounded border"
                                 style={{
                                    backgroundColor: "var(--tg-theme-bg-color)",
                                    color: "var(--tg-theme-text-color)",
                                 }}
                              />
                              <div className="flex gap-2">
                                 <input
                                    type="number"
                                    value={newDish.price || ""}
                                    onChange={(e) =>
                                       setNewDish({
                                          ...newDish,
                                          price: parseFloat(e.target.value),
                                       })
                                    }
                                    placeholder="Price"
                                    className="flex-1 p-2 rounded border"
                                    style={{
                                       backgroundColor: "var(--tg-theme-bg-color)",
                                       color: "var(--tg-theme-text-color)",
                                    }}
                                 />
                                 <input
                                    type="text"
                                    value={newDish.currency || ""}
                                    onChange={(e) =>
                                       setNewDish({
                                          ...newDish,
                                          currency: e.target.value,
                                       })
                                    }
                                    placeholder="USD"
                                    className="w-20 p-2 rounded border"
                                    style={{
                                       backgroundColor: "var(--tg-theme-bg-color)",
                                       color: "var(--tg-theme-text-color)",
                                    }}
                                 />
                              </div>
                              <input
                                 type="text"
                                 value={newDish.imageUrl || ""}
                                 onChange={(e) =>
                                    setNewDish({ ...newDish, imageUrl: e.target.value })
                                 }
                                 placeholder="Image URL"
                                 className="w-full p-2 rounded border"
                                 style={{
                                    backgroundColor: "var(--tg-theme-bg-color)",
                                    color: "var(--tg-theme-text-color)",
                                 }}
                              />
                              <button
                                 onClick={handleCreateDish}
                                 disabled={isSubmitting}
                                 className="w-full tg-btn"
                              >
                                 {isSubmitting ? "Adding..." : "Add Product"}
                              </button>
                           </div>

                           {dishes?.map((dish) => (
                              <div
                                 key={dish.id}
                                 className="p-3 rounded-lg"
                                 style={{
                                    backgroundColor:
                                       "var(--tg-theme-secondary-bg-color)",
                                 }}
                              >
                                 {editMode === dish.id ? (
                                    <div className="space-y-2">
                                       <input
                                          type="text"
                                          value={editDish.name || dish.name}
                                          onChange={(e) =>
                                             setEditDish({
                                                ...editDish,
                                                name: e.target.value,
                                             })
                                          }
                                          className="w-full p-2 rounded border"
                                          style={{
                                             backgroundColor:
                                                "var(--tg-theme-bg-color)",
                                             color: "var(--tg-theme-text-color)",
                                          }}
                                       />
                                       <textarea
                                          value={
                                             editDish.description ||
                                             dish.description
                                          }
                                          onChange={(e) =>
                                             setEditDish({
                                                ...editDish,
                                                description: e.target.value,
                                             })
                                          }
                                          className="w-full p-2 rounded border"
                                          style={{
                                             backgroundColor:
                                                "var(--tg-theme-bg-color)",
                                             color: "var(--tg-theme-text-color)",
                                          }}
                                       />
                                       <div className="flex gap-2">
                                          <input
                                             type="number"
                                             value={
                                                editDish.price ?? dish.price
                                             }
                                             onChange={(e) =>
                                                setEditDish({
                                                   ...editDish,
                                                   price: parseFloat(
                                                      e.target.value,
                                                   ),
                                                })
                                             }
                                             className="flex-1 p-2 rounded border"
                                             style={{
                                                backgroundColor:
                                                   "var(--tg-theme-bg-color)",
                                                color:
                                                   "var(--tg-theme-text-color)",
                                             }}
                                          />
                                          <button
                                             onClick={handleUpdateDish}
                                             disabled={isSubmitting}
                                             className="tg-btn px-4"
                                          >
                                             Save
                                          </button>
                                          <button
                                             onClick={() => setEditMode(null)}
                                             className="tg-btn-secondary px-4"
                                          >
                                             Cancel
                                          </button>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex justify-between items-start">
                                       <div className="flex-1">
                                          <p className="font-medium">{dish.name}</p>
                                          <p
                                             className="text-sm"
                                             style={{
                                                color: "var(--tg-theme-hint-color)",
                                             }}
                                          >
                                             {dish.description}
                                          </p>
                                          <p className="text-sm mt-1">
                                             {dish.price} {dish.currency} (stock:{" "}
                                             {dish.stock ?? 0})
                                          </p>
                                       </div>
                                       <button
                                          onClick={() => {
                                             setEditMode(dish.id);
                                             setEditDish({
                                                dishId: dish.id,
                                                name: dish.name,
                                                description: dish.description,
                                                price: dish.price,
                                                currency: dish.currency,
                                                restaurantId: selectedChannelId,
                                             });
                                          }}
                                          className="text-sm px-2 py-1 rounded"
                                          style={{
                                             color: "var(--tg-theme-button-color)",
                                          }}
                                       >
                                          Edit
                                       </button>
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === "inventory" && (
                        <div className="space-y-3">
                           {dishes?.map((dish) => (
                              <div
                                 key={dish.id}
                                 className="flex items-center justify-between p-3 rounded-lg"
                                 style={{
                                    backgroundColor:
                                       "var(--tg-theme-secondary-bg-color)",
                                 }}
                              >
                                 <div className="flex-1">
                                    <p className="font-medium">{dish.name}</p>
                                    <p
                                       className="text-sm"
                                       style={{ color: "var(--tg-theme-hint-color)" }}
                                    >
                                       Current stock: {dish.stock ?? 0}
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <input
                                       type="number"
                                       value={stockUpdate[dish.id] ?? dish.stock ?? 0}
                                       onChange={(e) =>
                                          setStockUpdate({
                                             ...stockUpdate,
                                             [dish.id]: parseInt(e.target.value),
                                          })
                                       }
                                       className="w-20 p-2 rounded border text-center"
                                       style={{
                                          backgroundColor: "var(--tg-theme-bg-color)",
                                          color: "var(--tg-theme-text-color)",
                                       }}
                                    />
                                    <button
                                       onClick={() => handleUpdateStock(dish.id)}
                                       disabled={isSubmitting}
                                       className="tg-btn"
                                    >
                                       Update
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === "store" && (
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-sm font-medium">
                                 Store Description
                              </label>
                              <textarea
                                 value={storeDescription}
                                 onChange={(e) => setStoreDescription(e.target.value)}
                                 placeholder="Enter store description"
                                 className="w-full p-3 rounded-lg border"
                                 rows={4}
                                 style={{
                                    backgroundColor:
                                       "var(--tg-theme-secondary-bg-color)",
                                    color: "var(--tg-theme-text-color)",
                                 }}
                              />
                              <button
                                 onClick={handleUpdateDescription}
                                 disabled={isSubmitting}
                                 className="w-full tg-btn"
                              >
                                 {isSubmitting ? "Saving..." : "Save Description"}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default AdminPage;