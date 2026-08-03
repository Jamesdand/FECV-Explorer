async function loadCommunities() {
    try {
        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error(
                `Unable to load data.json. Status: ${response.status}`
            );
        }

        const loadedData = await response.json();

        /*
        Supports either of these JSON structures:

        [
            { community records }
        ]

        or

        {
            "communities": [
                { community records }
            ]
        }
        */

        const communities = Array.isArray(loadedData)
            ? loadedData
            : loadedData.communities;

        if (!Array.isArray(communities)) {
            throw new Error(
                "data.json does not contain a valid communities array."
            );
        }

        const results = document.getElementById("results");
        const resultCount = document.getElementById("resultCount");
        const searchBox = document.getElementById("searchBox");
        const communityFilter = document.getElementById("communityFilter");
        const regionFilter = document.getElementById("regionFilter");
        const habitatFilter = document.getElementById("habitatFilter");
        const resetButton = document.getElementById("resetButton");

        const requiredElements = [
            results,
            resultCount,
            searchBox,
            communityFilter,
            regionFilter,
            habitatFilter,
            resetButton
        ];

        if (requiredElements.some(element => !element)) {
            throw new Error(
                "One or more required HTML elements could not be found."
            );
        }

        function escapeHTML(value) {
            return String(value ?? "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        function getArray(value) {
            return Array.isArray(value) ? value : [];
        }

        function getImage(item) {
            return item.image || item.heroImage || "";
        }

        function getHabitats(item) {
            return getArray(
                item.habitats || item.swapHabitats
            );
        }

        function getDescription(item) {
            return (
                item.description ||
                item.habitatDescription ||
                item.importanceToForestryOperations ||
                ""
            );
        }

        function getFactSheet(item) {
            return (
                item.factSheet ||
                item.factSheetUrl ||
                item.pdf ||
                ""
            );
        }

        function populateFilters() {
            communityFilter.innerHTML = `
                <option value="all">
                    All Forest Communities
                </option>
            `;

            habitatFilter.innerHTML = `
                <option value="all">
                    All SWAP Habitats
                </option>
            `;

            const communityNames = [
                ...new Set(
                    communities
                        .map(item => item.name)
                        .filter(Boolean)
                )
            ].sort((a, b) => a.localeCompare(b));

            const habitats = [
                ...new Set(
                    communities.flatMap(item => getHabitats(item))
                )
            ].sort((a, b) => a.localeCompare(b));

            communityNames.forEach(name => {
                const option = document.createElement("option");

                option.value = name;
                option.textContent = name;

                communityFilter.appendChild(option);
            });

            habitats.forEach(habitat => {
                const option = document.createElement("option");

                option.value = habitat;
                option.textContent = habitat;

                habitatFilter.appendChild(option);
            });
        }

        function createTags(items, className) {
            return getArray(items)
                .map(item => {
                    return `
                        <span class="tag ${className}">
                            ${escapeHTML(item)}
                        </span>
                    `;
                })
                .join("");
        }

        function createCard(item) {
            const name = escapeHTML(
                item.name || "Unnamed Forest Community"
            );

            const description = escapeHTML(
                getDescription(item) ||
                "Additional community information is available in the fact sheet."
            );

            const image = escapeHTML(getImage(item));
            const factSheet = escapeHTML(getFactSheet(item));

            const ecoregions = getArray(item.ecoregions);
            const habitats = getHabitats(item);

            const regionTags = createTags(
                ecoregions,
                "region-tag"
            );

            const habitatTags = createTags(
                habitats,
                "habitat-tag"
            );

            const factSheetButton = factSheet
                ? `
                    <a
                        class="card-button"
                        href="${factSheet}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Fact Sheet
                        <span aria-hidden="true">→</span>
                    </a>
                `
                : `
                    <span class="card-button card-button-disabled">
                        Fact Sheet Coming Soon
                    </span>
                `;

            return `
                <article class="card">

                    <div class="card-image-wrapper">

                        <img
                            class="card-image"
                            src="${image}"
                            alt="${name} forest community"
                            loading="lazy"
                        >

                    </div>

                    <div class="card-content">

                        <h3 class="card-title">
                            ${name}
                        </h3>

                        <p class="card-description">
                            ${description}
                        </p>

                        <div class="card-section">

                            <span class="card-section-title">
                                Ecoregions:
                            </span>

                            <div class="tag-list">
                                ${regionTags}
                            </div>

                        </div>

                        <div class="card-section">

                            <span class="card-section-title">
                                SWAP Priority Habitats:
                            </span>

                            <div class="tag-list">
                                ${habitatTags}
                            </div>

                        </div>

                        ${factSheetButton}

                    </div>

                </article>
            `;
        }

        function displayCards(data) {
            results.innerHTML = "";

            const communityWord =
                data.length === 1
                    ? "community"
                    : "communities";

            resultCount.textContent =
                `Showing ${data.length} of ${communities.length} forest ${communityWord}`;

            if (data.length === 0) {
                results.innerHTML = `
                    <p class="no-results">
                        No matching forest communities were found.
                    </p>
                `;

                return;
            }

            results.innerHTML = data
                .map(createCard)
                .join("");
        }

        function filterCommunities() {
            const searchTerm = searchBox.value
                .trim()
                .toLowerCase();

            const selectedCommunity =
                communityFilter.value;

            const selectedRegion =
                regionFilter.value;

            const selectedHabitat =
                habitatFilter.value;

            const filteredCommunities =
                communities.filter(item => {
                    const ecoregions =
                        getArray(item.ecoregions);

                    const habitats =
                        getHabitats(item);

                    const searchableText = [
                        item.name || "",
                        getDescription(item),
                        ...ecoregions,
                        ...habitats
                    ]
                        .join(" ")
                        .toLowerCase();

                    const matchesSearch =
                        searchTerm === "" ||
                        searchableText.includes(searchTerm);

                    const matchesCommunity =
                        selectedCommunity === "all" ||
                        item.name === selectedCommunity;

                    const matchesRegion =
                        selectedRegion === "all" ||
                        ecoregions.includes(selectedRegion);

                    const matchesHabitat =
                        selectedHabitat === "all" ||
                        habitats.includes(selectedHabitat);

                    return (
                        matchesSearch &&
                        matchesCommunity &&
                        matchesRegion &&
                        matchesHabitat
                    );
                });

            displayCards(filteredCommunities);
        }

        function resetFilters() {
            searchBox.value = "";
            communityFilter.value = "all";
            regionFilter.value = "all";
            habitatFilter.value = "all";

            displayCards(communities);
        }

        populateFilters();

        searchBox.addEventListener(
            "input",
            filterCommunities
        );

        communityFilter.addEventListener(
            "change",
            filterCommunities
        );

        regionFilter.addEventListener(
            "change",
            filterCommunities
        );

        habitatFilter.addEventListener(
            "change",
            filterCommunities
        );

        resetButton.addEventListener(
            "click",
            resetFilters
        );

        displayCards(communities);
    } catch (error) {
        console.error(error);

        const results =
            document.getElementById("results");

        const resultCount =
            document.getElementById("resultCount");

        if (resultCount) {
            resultCount.textContent = "";
        }

        if (results) {
            results.innerHTML = `
                <p class="no-results">
                    The forest community data could not be loaded.
                </p>
            `;
        }
    }
}

loadCommunities();