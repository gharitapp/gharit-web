/**
 * Gharit Pricing – loads articles and pricing from API and renders the pricing section.
 * Usage: ensure DOM has #gharit-services-list-pricing, #gharit-table-container-pricing,
 * #gharit-category-tabs-pricing, etc. Then call initPricingSection() when the pricing overlay is opened.
 */
(function () {
  const ARTICLES_API = "https://api.gharitapp.com/v1/articles";

  var gharitCategories = [];
  var gharitCategoryNames = {};
  var gharitServiceTypes = [];
  var gharitServiceMap = {};
  var gharitServicesData = {};
  var gharitActiveCategory = "";
  var gharitSearchQuery = "";
  var gharitIsGlobalSearch = false;
  var gharitDataReady = false;

  function gharitGetDirectImageUrl(url) {
    if (!url) return "https://placehold.co/150x150?text=No+Image";
    if (url.includes("github.com") && url.includes("/blob/")) {
      return url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    }
    return url;
  }

  function transformApiResponse(data) {
    var serviceMap = data.serviceMap || {};
    var order = [
      "IRONING",
      "DRY_CLEANING",
      "WET_CLEANING",
      "ROLL_PRESS",
      "PETROL_WASH",
      "CUSTOM",
    ];
    var seenTypes = {};
    data.articles.forEach(function (art) {
      (art.articlePricing || []).forEach(function (p) {
        seenTypes[p.serviceType] = true;
      });
    });
    gharitServiceTypes = order.filter(function (k) {
      return seenTypes[k] && serviceMap[k];
    });
    gharitServiceMap = serviceMap;

    var categoryOrder = [
      "MENS",
      "WOMENS",
      "KIDS",
      "SHOES",
      "BAGS",
      "HOUSEHOLDS",
    ];
    var categoryLabels = {
      MENS: "Men's",
      WOMENS: "Women's",
      KIDS: "Kids",
      SHOES: "Shoes",
      BAGS: "Bags",
      HOUSEHOLDS: "Household",
    };
    var byCategory = {};
    data.articles.forEach(function (art) {
      var cat = art.category || "OTHER";
      if (!byCategory[cat]) byCategory[cat] = [];
      var pricing = {};
      (art.articlePricing || []).forEach(function (p) {
        pricing[p.serviceType] = p.amount;
      });
      byCategory[cat].push({
        name: art.name,
        code: art.id,
        img: art.imageURL || null,
        desc: (art.description || "").trim().replace(/\n/g, " "),
        categoryName: categoryLabels[cat] || cat,
        pricing: pricing,
      });
    });

    gharitCategories = categoryOrder.filter(function (id) {
      return byCategory[id] && byCategory[id].length > 0;
    }).map(function (id) {
      return { id: id, label: categoryLabels[id] || id };
    });
    var otherCats = Object.keys(byCategory).filter(function (id) {
      return categoryOrder.indexOf(id) === -1;
    });
    otherCats.forEach(function (id) {
      gharitCategories.push({ id: id, label: categoryLabels[id] || id });
    });
    gharitCategoryNames = categoryLabels;
    gharitServicesData = byCategory;
    gharitActiveCategory =
      gharitCategories.length > 0 ? gharitCategories[0].id : "";
    gharitDataReady = true;
  }

  function gharitRenderTabs() {
    var container = document.getElementById("gharit-category-tabs-pricing");
    if (!container) return;
    container.innerHTML = gharitCategories
      .map(function (cat) {
        var isActive = cat.id === gharitActiveCategory;
        return (
          '<button onclick="window.gharitSwitchCategoryPricing(\'' +
          cat.id +
          "')\" class=\"gharit-tab-btn " +
          (isActive ? "active" : "") +
          '">' +
          cat.label +
          "</button>"
        );
      })
      .join("");
  }

  function gharitGetAllItems() {
    var allItems = [];
    gharitCategories.forEach(function (cat) {
      var catItems = gharitServicesData[cat.id] || [];
      catItems.forEach(function (item) {
        allItems.push({
          name: item.name,
          code: item.code,
          img: item.img,
          desc: item.desc,
          categoryName: gharitCategoryNames[cat.id],
          pricing: item.pricing,
        });
      });
    });
    return allItems;
  }

  function gharitGetFilteredItems() {
    if (gharitIsGlobalSearch && gharitSearchQuery) {
      var allItems = gharitGetAllItems();
      var query = gharitSearchQuery.toLowerCase();
      return allItems.filter(function (item) {
        return (
          item.name.toLowerCase().indexOf(query) !== -1 ||
          item.code.toLowerCase().indexOf(query) !== -1 ||
          item.desc.toLowerCase().indexOf(query) !== -1
        );
      });
    }
    var data = gharitServicesData[gharitActiveCategory] || [];
    if (!gharitSearchQuery) return data;
    var query = gharitSearchQuery.toLowerCase();
    return data.filter(function (item) {
      return (
        item.name.toLowerCase().indexOf(query) !== -1 ||
        item.code.toLowerCase().indexOf(query) !== -1 ||
        item.desc.toLowerCase().indexOf(query) !== -1
      );
    });
  }

  function gharitGetTotalItemCount() {
    var count = 0;
    gharitCategories.forEach(function (cat) {
      count += (gharitServicesData[cat.id] || []).length;
    });
    return count;
  }

  function gharitEscapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function gharitHighlightText(text, query) {
    if (!query) return text;
    var regex = new RegExp("(" + gharitEscapeRegex(query) + ")", "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  function gharitBuildHeader() {
    var container = document.getElementById("gharit-table-container-pricing");
    var header = container && container.querySelector(".gharit-table-header");
    if (!header || !container) return;
    container.setAttribute("data-dynamic-pricing", "true");
    var n = gharitServiceTypes.length;
    var cols = "2fr " + "repeat(" + n + ", minmax(80px, 1fr)) 2fr";
    header.style.gridTemplateColumns = cols;
    var priceCols = gharitServiceTypes
      .map(function (st) {
        return (
          '<div class="gharit-header-col-price">' +
          (gharitServiceMap[st] || st) +
          "</div>"
        );
      })
      .join("");
    header.innerHTML =
      '<div class="gharit-header-col-service">Service</div>' +
      priceCols +
      '<div class="gharit-header-col-desc">Description</div>';
  }

  function gharitRenderServices() {
    var container = document.getElementById("gharit-services-list-pricing");
    if (!container) return;
    var data = gharitGetFilteredItems();
    var n = gharitServiceTypes.length;
    var gridCols =
      "2fr " + "repeat(" + n + ", minmax(80px, 1fr)) 2fr";

    var resultsCount = document.getElementById("gharit-results-count-pricing");
    var totalItems = gharitIsGlobalSearch
      ? gharitGetTotalItemCount()
      : (gharitServicesData[gharitActiveCategory] || []).length;
    if (resultsCount) {
      if (gharitSearchQuery) {
        resultsCount.textContent = "Found " + data.length + " of " + totalItems + " items";
      } else {
        resultsCount.textContent = totalItems + " items available";
      }
    }

    if (data.length === 0) {
      container.innerHTML =
        '<div class="gharit-no-results">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>' +
        '<p class="gharit-no-results-title">No items found</p>' +
        '<p class="gharit-no-results-text">Try adjusting your search terms</p>' +
        "</div>";
      return;
    }

    container.innerHTML = "";
    data.forEach(function (item, index) {
      var row = document.createElement("div");
      row.className = "gharit-service-row";
      row.style.animationDelay = index * 0.03 + "s";
      row.style.gridTemplateColumns = gridCols;

      var imageUrl = gharitGetDirectImageUrl(item.img);
      var highlightedName = gharitSearchQuery
        ? gharitHighlightText(item.name, gharitSearchQuery)
        : item.name;
      var categoryBadge =
        gharitIsGlobalSearch && item.categoryName
          ? '<span class="gharit-category-badge">' + item.categoryName + "</span>"
          : "";

      var priceCells = gharitServiceTypes
        .map(function (st) {
          var amt = item.pricing && item.pricing[st];
          var str = amt != null && amt !== "" ? "₹" + amt : "-";
          var cls = amt != null && amt !== "" ? "accent" : "muted";
          var label = gharitServiceMap[st] || st;
          return (
            '<div class="gharit-price-cell">' +
            '<span class="gharit-price-label">' + label + "</span>" +
            '<span class="gharit-price-value ' + cls + '">' + str + "</span>" +
            "</div>"
          );
        })
        .join("");

      row.innerHTML =
        '<div class="gharit-service-info">' +
        '<div class="gharit-img-container">' +
        '<img src="' +
        imageUrl +
        '" alt="' +
        (item.name || "").replace(/"/g, "&quot;") +
        '" onerror="this.src=\'https://placehold.co/150x150?text=' +
        (item.code || "?") +
        '\'">' +
        "</div>" +
        '<div class="gharit-service-details">' +
        "<h3>" + highlightedName + categoryBadge + "</h3>" +
        '<span class="gharit-service-code">' + item.code + "</span>" +
        '<p class="gharit-service-desc-mobile">' + (item.desc || "") + "</p>" +
        "</div>" +
        "</div>" +
        priceCells +
        '<div class="gharit-desc-cell">' +
        '<div class="gharit-desc-box">' +
        '<p class="gharit-desc-text">' + (item.desc || "") + "</p>" +
        "</div>" +
        "</div>";
      container.appendChild(row);
    });
  }

  window.gharitSwitchCategoryPricing = function (id) {
    gharitActiveCategory = id;
    if (gharitIsGlobalSearch) {
      gharitIsGlobalSearch = false;
      gharitSearchQuery = "";
      var searchInput = document.getElementById("gharit-search-input-pricing");
      if (searchInput) searchInput.value = "";
      var clearBtn = document.getElementById("gharit-clear-search-pricing");
      if (clearBtn) clearBtn.classList.remove("visible");
      var activeFilters = document.getElementById("gharit-active-filters-pricing");
      if (activeFilters) activeFilters.classList.remove("visible");
      var tabsNav = document.getElementById("gharit-tabs-nav-pricing");
      if (tabsNav) tabsNav.style.display = "block";
      var tableContainer = document.getElementById("gharit-table-container-pricing");
      if (tableContainer) tableContainer.classList.remove("gharit-global-search-mode");
    }
    gharitRenderTabs();
    gharitRenderServices();
  };

  window.gharitClearSearchPricing = function () {
    var searchInput = document.getElementById("gharit-search-input-pricing");
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    gharitSearchQuery = "";
    gharitIsGlobalSearch = false;
    var clearBtn = document.getElementById("gharit-clear-search-pricing");
    if (clearBtn) clearBtn.classList.remove("visible");
    var activeFilters = document.getElementById("gharit-active-filters-pricing");
    if (activeFilters) activeFilters.classList.remove("visible");
    var tabsNav = document.getElementById("gharit-tabs-nav-pricing");
    if (tabsNav) tabsNav.style.display = "block";
    var tableContainer = document.getElementById("gharit-table-container-pricing");
    if (tableContainer) tableContainer.classList.remove("gharit-global-search-mode");
    gharitRenderServices();
  };

  function gharitHandleSearch(e) {
    gharitSearchQuery = (e.target.value || "").trim();
    var clearBtn = document.getElementById("gharit-clear-search-pricing");
    var activeFilters = document.getElementById("gharit-active-filters-pricing");
    var searchTerm = document.getElementById("gharit-search-term-pricing");
    var tabsNav = document.getElementById("gharit-tabs-nav-pricing");
    var tableContainer = document.getElementById("gharit-table-container-pricing");

    if (gharitSearchQuery) {
      gharitIsGlobalSearch = true;
      if (clearBtn) clearBtn.classList.add("visible");
      if (activeFilters) activeFilters.classList.add("visible");
      if (searchTerm) searchTerm.textContent = gharitSearchQuery;
      if (tabsNav) tabsNav.style.display = "none";
      if (tableContainer) tableContainer.classList.add("gharit-global-search-mode");
    } else {
      gharitIsGlobalSearch = false;
      if (clearBtn) clearBtn.classList.remove("visible");
      if (activeFilters) activeFilters.classList.remove("visible");
      if (tabsNav) tabsNav.style.display = "block";
      if (tableContainer) tableContainer.classList.remove("gharit-global-search-mode");
    }
    gharitRenderServices();
  }

  function attachPricingListeners() {
    var searchInput = document.getElementById("gharit-search-input-pricing");
    if (searchInput) searchInput.addEventListener("input", gharitHandleSearch);

    var servicesListEl = document.getElementById("gharit-services-list-pricing");
    if (servicesListEl) {
      var touchStartX = 0;
      var touchEndX = 0;
      var swipeThreshold = 50;
      servicesListEl.addEventListener(
        "touchstart",
        function (e) {
          if (e.changedTouches && e.changedTouches[0])
            touchStartX = e.changedTouches[0].screenX;
        },
        false
      );
      servicesListEl.addEventListener(
        "touchend",
        function (e) {
          if (e.changedTouches && e.changedTouches[0])
            touchEndX = e.changedTouches[0].screenX;
          var diff = touchStartX - touchEndX;
          var absDir = Math.abs(diff);
          if (absDir < swipeThreshold || window.innerWidth >= 768) return;
          var currentIndex = gharitCategories.findIndex(function (c) {
            return c.id === gharitActiveCategory;
          });
          if (diff > 0 && currentIndex < gharitCategories.length - 1) {
            window.gharitSwitchCategoryPricing(gharitCategories[currentIndex + 1].id);
          } else if (diff < 0 && currentIndex > 0) {
            window.gharitSwitchCategoryPricing(gharitCategories[currentIndex - 1].id);
          }
        },
        false
      );
    }
  }

  function injectDynamicPricingStyles() {
    if (document.getElementById("gharit-dynamic-pricing-styles")) return;
    var style = document.createElement("style");
    style.id = "gharit-dynamic-pricing-styles";
    style.textContent =
      "#gharit-table-container-pricing[data-dynamic-pricing] .gharit-header-col-service," +
      "#gharit-table-container-pricing[data-dynamic-pricing] .gharit-header-col-price," +
      "#gharit-table-container-pricing[data-dynamic-pricing] .gharit-header-col-desc," +
      "#gharit-table-container-pricing[data-dynamic-pricing] .gharit-service-info," +
      "#gharit-table-container-pricing[data-dynamic-pricing] .gharit-price-cell," +
      "#gharit-table-container-pricing[data-dynamic-pricing] .gharit-desc-cell { grid-column: auto; }";
    document.head.appendChild(style);
  }

  window.initPricingSection = function () {
    var container = document.getElementById("gharit-services-list-pricing");
    if (!container) return;

    if (gharitDataReady) {
      injectDynamicPricingStyles();
      gharitBuildHeader();
      gharitRenderTabs();
      gharitRenderServices();
      attachPricingListeners();
      return;
    }

    container.innerHTML =
      '<div class="gharit-no-results" style="padding:2rem;text-align:center">' +
      '<p class="gharit-no-results-title">Loading pricing…</p>' +
      "</div>";

    fetch(ARTICLES_API, { method: "GET" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data && data.articles) {
          transformApiResponse(data);
          injectDynamicPricingStyles();
          gharitBuildHeader();
          gharitRenderTabs();
          gharitRenderServices();
          attachPricingListeners();
        } else {
          container.innerHTML =
            '<div class="gharit-no-results">' +
            '<p class="gharit-no-results-title">Could not load pricing</p>' +
            '<p class="gharit-no-results-text">Please try again later</p>' +
            "</div>";
        }
      })
      .catch(function () {
        container.innerHTML =
          '<div class="gharit-no-results">' +
          '<p class="gharit-no-results-title">Could not load pricing</p>' +
          '<p class="gharit-no-results-text">Please check your connection and try again</p>' +
          "</div>";
      });
  };
})();
