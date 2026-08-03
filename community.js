async function loadCommunity() {

    try {

        const params = new URLSearchParams(window.location.search);

        const id = Number(params.get("id"));

        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("Unable to load data.");
        }

        const communities = await response.json();

        const community = communities.find(item => item.id === id);

        if (!community) {

            document.body.innerHTML = `
                <div style="padding:60px;font-family:Arial,sans-serif;">
                    <h1>Forest Community Not Found</h1>

                    <p>
                        The requested forest community could not be located.
                    </p>

                    <p>
                        <a href="index.html">
                            Return to Explorer
                        </a>
                    </p>
                </div>
            `;

            return;

        }


        document.title = community.name + " | Georgia Forest Community Explorer";


        document.querySelector(".hero").style.backgroundImage =
            `url('${community.image}')`;


        document.getElementById("communityName").textContent =
            community.name;


        document.getElementById("communitySubtitle").textContent =
            community.subtitle || "";


        document.getElementById("communityDescription").textContent =
            community.description || "";


        function buildTags(elementId, values) {

            const container = document.getElementById(elementId);

            container.innerHTML = "";

            if (!Array.isArray(values) || values.length === 0) {

                container.innerHTML =
                    "<span class='tag'>Information Coming Soon</span>";

                return;

            }

            values.forEach(function(value){

                const tag = document.createElement("span");

                tag.className = "tag";

                tag.textContent = value;

                container.appendChild(tag);

            });

        }



        function buildList(elementId, values) {

            const list = document.getElementById(elementId);

            list.innerHTML = "";

            if (!Array.isArray(values) || values.length === 0) {

                list.innerHTML =
                    "<li>Information Coming Soon</li>";

                return;

            }

            values.forEach(function(value){

                const li = document.createElement("li");

                li.textContent = value;

                list.appendChild(li);

            });

        }



        buildTags(
            "ecoregions",
            community.ecoregions
        );


        buildTags(
            "habitats",
            community.habitats
        );


        buildTags(
            "species",
            community.prioritySpecies
        );


        buildList(
            "managementList",
            community.forestryConsiderations
        );


        buildList(
            "threatList",
            community.threats
        );


        const factButton =
            document.getElementById("factSheetButton");


        factButton.href =
            community.factSheet;


    }

    catch(error) {

        console.error(error);

        document.body.innerHTML = `
            <div style="padding:60px;font-family:Arial,sans-serif;">

                <h1>
                    An error occurred.
                </h1>

                <p>
                    The forest community could not be loaded.
                </p>

                <p>
                    <a href="index.html">
                        Return to Explorer
                    </a>
                </p>

            </div>
        `;

    }

}

loadCommunity();