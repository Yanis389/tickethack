document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Script.js chargé");

    // 🔗 Gestion de la navigation
    document.getElementById('cartButton')?.addEventListener('click', () => {
        window.location.href = "cart.html";
    });

    document.getElementById('bookingsButton')?.addEventListener('click', () => {
        window.location.href = "bookings.html";
    });

    document.getElementById('logo')?.addEventListener('click', () => {
        window.location.href = "index.html";
    });

    // 📌 Gestion du formulaire de recherche de trajets
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const departure = document.getElementById('departure').value.trim();
            const arrival = document.getElementById('arrival').value.trim();
            const date = document.getElementById('date').value;

            console.log(`🔍 Recherche : ${departure} → ${arrival} | Date : ${date}`);

            const tripsList = document.getElementById('tripsList');
            const defaultImage = document.getElementById('defaultImage');

            tripsList.innerHTML = '';

            try {
                const response = await fetch("http://localhost:3000/tickets", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ departure, arrival, date }),
                });

                const data = await response.json();

                if (!data.result) {
                    defaultImage.src = 'images/notfound.png';
                    defaultImage.style.display = 'block';
                    console.log("🚨 Aucun trajet trouvé.");
                } else {
                    defaultImage.style.display = 'none';
                    data.tickets.forEach(trip => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>${trip.departure} → ${trip.arrival}</strong><br>
                                        📅 ${trip.date} | ⏰ ${trip.time} | 💰 ${trip.price}€`;

                        const addButton = document.createElement('button');
                        addButton.textContent = 'Ajouter au panier';
                        addButton.addEventListener('click', () => {
                            addToCart(trip);
                        });

                        li.appendChild(addButton);
                        tripsList.appendChild(li);
                    });
                    console.log("✅ Trajets affichés.");
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des trajets :", error);
            }
        });
    }

    // 📌 Fonction pour ajouter un trajet au panier
    function addToCart(trip) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(trip);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`🛒 Ajouté au panier : ${trip.departure} → ${trip.arrival} à ${trip.time}`);
    }

    // 📌 Affichage des trajets du panier sur cart.html
    if (window.location.pathname.includes("cart.html")) {
        displayCart();
    }

    function displayCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartList = document.getElementById('cartList');
        const totalPriceElement = document.getElementById('totalPrice');
        const checkoutButton = document.getElementById('checkoutButton');

        cartList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartList.innerHTML = "<p>Votre panier est vide.</p>";
            checkoutButton.style.display = "none";
        } else {
            checkoutButton.style.display = "block";
            cart.forEach((trip, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${trip.departure} → ${trip.arrival}</strong><br>
                                📅 ${trip.date} | ⏰ ${trip.time} | 💰 ${trip.price}€`;

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Supprimer';
                removeButton.addEventListener('click', () => {
                    removeFromCart(index);
                });

                li.appendChild(removeButton);
                cartList.appendChild(li);
                total += parseFloat(trip.price);
            });
            totalPriceElement.textContent = `Total : ${total}€`;
        }
    }

    function removeFromCart(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }

    // 📌 Validation du panier et enregistrement des réservations
    if (window.location.pathname.includes("cart.html")) {
        document.getElementById('checkoutButton')?.addEventListener('click', async () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            if (cart.length === 0) {
                alert("🛑 Votre panier est vide.");
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trips: cart })
                });

                if (response.ok) {
                    localStorage.removeItem('cart');
                    window.location.href = "bookings.html";
                } else {
                    alert("❌ Erreur lors du paiement.");
                }
            } catch (error) {
                console.error("❌ Erreur :", error);
            }
        });
    }

    // 📌 Affichage des réservations sur bookings.html
    if (window.location.pathname.includes("bookings.html")) {
        displayBookings();
    }

    async function displayBookings() {
        try {
            const response = await fetch('http://localhost:3000/bookings');
            const bookings = await response.json();
            const bookingsList = document.getElementById('bookingsList');

            bookingsList.innerHTML = '';

            if (!bookings.result) {
                bookingsList.innerHTML = "<p>Aucune réservation trouvée.</p>";
            } else {
                bookings.bookings.forEach(booking => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${booking.departure} → ${booking.arrival}</strong><br>
                                    📅 ${booking.date} | ⏰ ${booking.time} | 💰 ${booking.price}€`;

                    bookingsList.appendChild(li);
                });
            }
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des réservations :", error);
        }
    }
});
