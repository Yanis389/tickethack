document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Script chargé");
  
    // Navigation entre les pages
    document.getElementById("cartButton")?.addEventListener("click", () => window.location.href = "cart.html");
    document.getElementById("bookingsButton")?.addEventListener("click", () => window.location.href = "bookings.html");
    document.getElementById("logo")?.addEventListener("click", () => window.location.href = "index.html");
  
    // Recherche de trajets
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
                            let cart = JSON.parse(localStorage.getItem("cart")) || [];
                            cart.push(trip);
                            localStorage.setItem("cart", JSON.stringify(cart));
                            alert(`🛒 Ajouté : ${trip.departure} → ${trip.arrival}`);
                        });
  
                        li.appendChild(addButton);
                        tripsList.appendChild(li);
                    });
                })
                .catch(error => console.error("❌ Erreur lors de la recherche :", error));
        });
    }
  
    // Affichage du panier (cart.html)
    if (window.location.pathname.includes("cart.html")) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartList = document.getElementById("cartList");
        const totalPriceElement = document.getElementById("totalPrice");
        const checkoutButton = document.getElementById("checkoutButton");
        
        cartList.innerHTML = "";
        if (cart.length === 0) {
            cartList.innerHTML = "<p>Votre panier est vide.</p>";
            checkoutButton.style.display = "none";
            return;
        }
        checkoutButton.style.display = "block";
        
        let total = 0;
        cart.forEach((trip, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${trip.departure} → ${trip.arrival}</strong><br>
                📅 ${trip.date} | ⏰ ${trip.time} | 💰 ${trip.price}€
            `;
  
            const removeButton = document.createElement("button");
            removeButton.textContent = "Supprimer";
            removeButton.addEventListener("click", function () {
                cart.splice(index, 1);
                localStorage.setItem("cart", JSON.stringify(cart));
                location.reload();
            });
  
            li.appendChild(removeButton);
            cartList.appendChild(li);
            total += parseFloat(trip.price);
        });
        totalPriceElement.textContent = `Total : ${total}€`;
        
        checkoutButton.addEventListener("click", function () {
            if (cart.length === 0) {
                alert("🛑 Votre panier est vide.");
                return;
            }
            
            fetch("http://localhost:3000/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trips: cart })
            })
            .then(response => response.ok ? response.json() : Promise.reject("Erreur lors du paiement."))
            .then(() => {
                localStorage.removeItem("cart");
                window.location.href = "bookings.html";
            })
            .catch(error => {
                alert("❌ Erreur lors du paiement.");
                console.error("❌ Erreur :", error);
            });
        });
    }
  
    // Affichage des réservations (bookings.html)
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
                        <strong>${booking.departure} → ${booking.arrival}</strong><br>
                        ⏰ ${tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | 💰 ${booking.price}€ | 
                        🚀 Dans ${hoursLeft}h ${minutesLeft}m
                    `;
                    bookingsList.appendChild(li);
                });
            })
            .catch(error => console.error("❌ Erreur lors de la récupération des réservations :", error));
    }
  });
  