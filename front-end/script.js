document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Script chargé");

  document.getElementById("cartButton")?.addEventListener("click", () => window.location.href = "cart.html");
  document.getElementById("bookingsButton")?.addEventListener("click", () => window.location.href = "bookings.html");
  document.getElementById("logo")?.addEventListener("click", () => window.location.href = "index.html");

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
          e.preventDefault();
          
          const departure = document.getElementById("departure").value.trim();
          const arrival = document.getElementById("arrival").value.trim();
          const date = document.getElementById("date").value;
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const fullDate = `${date} ${time}`;
          
          const tripsList = document.getElementById("tripsList");
          const defaultImage = document.getElementById("defaultImage");
          tripsList.innerHTML = "";

          fetch(`http://localhost:3000/tickets?departure=${departure}&arrival=${arrival}&date=${fullDate}`)
              .then(response => response.json())
              .then(data => {
                  if (!data.result) {
                      defaultImage.src = "images/notfound.png";
                      defaultImage.style.display = "block";
                      return;
                  }
                  defaultImage.style.display = "none";

                  data.tickets.forEach(trip => {
                      const li = document.createElement("li");
                      const tripDate = new Date(trip.date);
                      const formattedTime = tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                      li.innerHTML = `
                          <strong>${trip.departure} → ${trip.arrival}</strong><br>
                          ⏰ ${formattedTime} | 💰 ${trip.price}€
                      `;

                      const addButton = document.createElement("button");
                      addButton.textContent = "Réserver";
                      addButton.id = trip._id;
                      
                      addButton.addEventListener("click", function () {
                          console.log("Bouton cliqué pour le voyage:", trip);
                      
                          fetch(`http://localhost:3000/cart/${this.id}`, {  
                              method: "POST",
                              headers: {
                                  "Content-Type": "application/json"
                              },
                              body: JSON.stringify({ id_ticket: this.id })  
                          })
                          .then(response => {
                              console.log("Réponse du serveur:", response);
                              if (!response.ok) {
                                  throw new Error("Erreur lors de l'ajout au panier");
                              }
                              return response.json();
                          })
                          .then(data => {
                              console.log("Données retournées:", data);
                              if (data.result) {  
                                  alert(`🛒 Ajouté : ${trip.departure} → ${trip.arrival}`);
                                  window.location.href = "cart.html";
                              } else {
                                  throw new Error(data.error || "Erreur inconnue");
                              }
                          })
                          .catch(error => {
                              console.error("Erreur:", error);
                              alert(`❌ Échec de l'ajout au panier : ${error.message}`);
                          });
                      });
                      

                      li.appendChild(addButton);
                      tripsList.appendChild(li);
                  });
              })
              .catch(error => console.error("❌ Erreur lors de la recherche :", error));
      });
  }

        if (window.location.pathname.includes("cart.html")) {
            const cartList = document.getElementById("cartList");
            const totalPriceElement = document.getElementById("totalPrice");
            const payButton = document.getElementById("pay");
        
            if (payButton) {
                payButton.style.display = "none";
            }
        
            fetch("http://localhost:3000/cart")
                .then(response => response.json())
                .then(data => {
                    cartList.innerHTML = "";
                    if (!data.result || data.tickets.length === 0) {
                        cartList.innerHTML = "<p>Votre panier est vide.</p>";
                        if (payButton) {
                            payButton.style.display = "none";
                        }
                        return;
                    }
        
                    if (payButton) {
                        payButton.style.display = "block";
                    }
        
                    let total = 0;
        
                    data.tickets.forEach((trip, index) => {
                        const li = document.createElement("li");
                        const tripDate = new Date(trip.date);
                        const formattedDate = tripDate.toLocaleDateString();
                        const formattedTime = tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        
                        li.innerHTML = `
                            <strong>${trip.departure} → ${trip.arrival}</strong><br>
                            📅 ${formattedDate} | ⏰ ${formattedTime} | 💰 ${trip.price}€
                        `;
        
                        // ❌ Bouton de suppression
                        const removeButton = document.createElement("button");
                        removeButton.textContent = "Supprimer";
                        removeButton.id = data.tickets[index].id_cart; 

                        removeButton.addEventListener("click", function () {
                            console.log("🗑️ Bouton 'Supprimer' cliqué pour le panier ID:", this.id);
        
                            console.log("Envoi de la requête de paiement avec les tickets :", data.tickets)
                            fetch(`http://localhost:3000/cart/${this.id}`, {
                                method: "DELETE",
                            })
                            .then(response => {
                                console.log("📨 Réponse brute du serveur :", response);
                                return response.json();
                            })
                            .then(result => {
                                console.log("✅ Résultat du serveur :", result);
        
                                if (result.result) {
                                    alert("🗑️ Voyage supprimé du panier.");
                                    console.log("🔄 Rafraîchissement de la page après suppression.");
                                    location.reload();
                                } else {
                                    console.warn("❌ Erreur lors de la suppression :", result.error);
                                    alert("❌ Erreur lors de la suppression.");
                                }
                            })
                            .catch(error => {
                                console.error("🚨 Erreur lors de la suppression :", error);
                            });
                        });
        
                        li.appendChild(removeButton); 
                        cartList.appendChild(li);
        
                        total += parseFloat(trip.price);
                    });

                    totalPriceElement.textContent = `Total : ${total}€`;

                    payButton.addEventListener("click", function () {

                        if (!data.tickets || data.tickets.length === 0) {
                            alert("❌ Aucun ticket dans le panier !");
                            return;
                        }

                        fetch("http://localhost:3000/purchase", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },

                        })                        
                        .then(response => {
                            console.log("📨 Réponse brute du serveur :", response);
                            return response.json();
                        })
                        .then(result => {
                            console.log("✅ Réponse JSON du serveur :", result);
                            if (result.result) {
                                alert("🎉 Paiement réussi ! Redirection vers les réservations...");
                                window.location.href = "bookings.html";
                            } else {
                                alert(`❌ Erreur : ${result.error}`);
                            }
                        })
                        .catch(error => console.error("🚨 Erreur dans le fetch :", error));
                        
                    });
                })
                .catch(error => console.error("❌ Erreur lors de la récupération du panier :", error));
        }

        if (window.location.pathname.includes("bookings.html")) {
            fetch("http://localhost:3000/bookings")
                .then(response => response.json())
                .then(bookings => {
                    const bookingsList = document.getElementById("bookingsList");
                    bookingsList.innerHTML = "";
                    
                    if (!bookings.result) {
                        bookingsList.innerHTML = "<p>Aucune réservation trouvée.</p>";
                        return;
                    }

                    bookings.bookings.forEach(booking => {
                        const li = document.createElement("li");
                        const tripDate = new Date(booking.date);
                        const now = new Date();
                        const timeDifference = tripDate - now;
                        const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60)); // Nombre d'heures restantes
                        const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // Minutes restantes

                        li.innerHTML = `
                            <strong>${booking.departure} → ${booking.arrival}</strong>

                            ⏰ ${tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | 💰 ${booking.price}€ | 
                            🚀 Dans ${hoursLeft}h ${minutesLeft}m
                        `;
                        bookingsList.appendChild(li);
                    });
                })
                .catch(error => console.error("❌ Erreur lors de la récupération des réservations :", error));
        }
});
  
