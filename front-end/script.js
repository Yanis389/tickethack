document.addEventListener('DOMContentLoaded', () => {
    // Gestion de la navigation
    document.getElementById('cartButton')?.addEventListener('click', () => {
        window.location.href = "cart.html";
    });

    document.getElementById('bookingsButton')?.addEventListener('click', () => {
        window.location.href = "bookings.html";
    });

    document.getElementById('logo')?.addEventListener('click', () => {
        window.location.href = "index.html";
    });

    // Gestion du formulaire de recherche
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const departure = document.getElementById('departure').value.trim().toLowerCase();
            const arrival = document.getElementById('arrival').value.trim().toLowerCase();
            const date = document.getElementById('date').value;

            const tripsList = document.getElementById('tripsList');
            const defaultImage = document.getElementById('defaultImage');

            tripsList.innerHTML = '';

            try {
                const response = await fetch(`http://localhost:3000/trips?departure=${departure}&arrival=${arrival}&date=${date}`);
                const trips = await response.json();

                if (trips.length === 0) {
                    defaultImage.src = 'images/notfound.png';
                    defaultImage.style.display = 'block';
                } else {
                    defaultImage.style.display = 'none';
                    trips.forEach(trip => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>${trip.departure} → ${trip.arrival}</strong><br>
                                        📅 ${trip.date} | ⏰ ${trip.time} | 💰 ${trip.price}`;

                        const addButton = document.createElement('button');
                        addButton.textContent = 'Ajouter au panier';
                        addButton.addEventListener('click', () => {
                            alert(`Ajouté au panier : ${trip.departure} → ${trip.arrival} à ${trip.time}`);
                        });

                        li.appendChild(addButton);
                        tripsList.appendChild(li);
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des trajets :", error);
            }
        });
    }
});
