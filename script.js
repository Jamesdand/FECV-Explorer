async function loadCommunities() {

    const response = await fetch("data.json");
    const communities = await response.json();

    const results = document.getElementById("results");

    function displayCards(data) {

        results.innerHTML = "";

        data.forEach(item => {

            results.innerHTML += `

            <div class="card">

                <h3>${item.name}</h3>

                <p><strong>Ecoregion:</strong> ${item.ecoregion}</p>

                <p><strong>SWAP Habitat:</strong> ${item.habitat}</p>

                <p>${item.description}</p>

                <a class="cardButton" href="${item.pdf}">
                    Open Fact Sheet
                </a>

            </div>

            `;

        });

    }

    displayCards(communities);

}

loadCommunities();