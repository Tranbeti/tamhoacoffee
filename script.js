// START: config
/**
 * Cấu hình trung tâm của quán cà phê
 * TODO: Thay đổi thông tin thực tế của quán tại đây
 */
const CONFIG = {
  name: "Tâm Hoa Coffee & Cafe", // TODO: Tên quán của bạn
  slogan: "Hạt rang thủ công – Góc nhỏ an yên giữa phố", // TODO: Slogan / điểm khác biệt
  style: "Specialty hiện đại kết hợp Rustic ấm cúng",
  phone: "0352044431", // TODO: Số điện thoại liên hệ
  phoneDisplay: "0352044431", // TODO: Số điện thoại hiển thị đẹp
  zalo: "0352044431", // TODO: Số Zalo nhận tin nhắn
  address: "Tâm Hoa Coffee Xã Núi Thành Thành Phố Đà Nẵng", // TODO: Địa chỉ thực tế
  mapsQuery: "Tâm Hoa Coffee Xã Núi Thành Thành Phố Đà Nẵng", // TODO: Từ khóa tìm trên Google Maps
  openTime: "07:00",
  closeTime: "11:00",
  bookingEndpoint: "", // TODO: Dán URL Google Apps Script / Webhook nhận form Booking (để trống sẽ dùng chế độ giả lập/Zalo)
  socials: {
    facebook: "https://facebook.com/", // TODO: Link Fanpage
    instagram: "https://instagram.com/", // TODO: Link Instagram
    tiktok: "https://tiktok.com/", // TODO: Link TikTok
  },
};
// END: config

// START: base
/**
 * Hàm tiện ích truy vấn DOM ngắn gọn
 */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Định dạng số tiền sang chuẩn Việt Nam (ví dụ: 45000 -> "45.000đ")
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) return "0đ";
  return `${num.toLocaleString("vi-VN")}đ`;
}

/**
 * Ẩn các thẻ <img> bị lỗi hoặc chưa có file ảnh thật để lộ nền màu/gradient dự phòng
 * Xử lý cả ảnh đã lỗi trước khi JS chạy lẫn ảnh được render động sau này
 * @param {ParentNode} root
 */
function initImageFallback(root = document) {
  const images = $$("img", root);

  const handleBrokenImage = (img) => {
    img.classList.add("is-broken");
    if (img.parentElement) {
      img.parentElement.classList.add("has-broken-img");
    }
  };

  images.forEach((img) => {
    if (img.dataset.fallbackBound === "true") return;
    img.dataset.fallbackBound = "true";

    img.addEventListener("error", () => handleBrokenImage(img), { once: true });

    // Kiểm tra ngay nếu ảnh đã tải xong và bị lỗi trước khi JS kịp gắn sự kiện
    if (img.complete && img.naturalWidth === 0) {
      handleBrokenImage(img);
    }
  });
}

/**
 * Khởi chạy toàn bộ các phân khu khi DOM đã sẵn sàng
 */
function initApp() {
  initImageFallback();
  initHeader();
  initHero();
  initAbout();
  initMenu();
  initFeatures();
  initGallery();
  initReviews();
  initPromo();
  initBooking();
  initContact();
  initFooter();
  initFloating();
  initEffects();
}

document.addEventListener("DOMContentLoaded", initApp);
// END: base

// START: header
function initHeader() {
  const header = $("#header");
  const toggleBtn = $("#header-toggle");
  const nav = $("#header-nav");
  const backdrop = $("#header-backdrop");
  const navLinks = $$(".header__link, .header__cta", header);

  if (!header) return;

  // Đổi nền Header khi cuộn quá 40px
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Đóng / Mở menu trên Mobile
  const openMenu = () => {
    header.classList.add("is-menu-open");
    document.body.classList.add("is-menu-open");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Đóng menu điều hướng");
    }
  };

  const closeMenu = (returnFocus = false) => {
    if (!header.classList.contains("is-menu-open")) return;
    header.classList.remove("is-menu-open");
    document.body.classList.remove("is-menu-open");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Mở menu điều hướng");
      if (returnFocus) toggleBtn.focus();
    }
  };

  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = header.classList.contains("is-menu-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => closeMenu());
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  // Đóng khi nhấn phím ESC hoặc click ra ngoài vùng menu
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu(true);
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("is-menu-open")) return;
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      closeMenu();
    }
  });

  // Làm nổi bật link của section đang xem bằng IntersectionObserver
  const sections = $$("main section[id]");
  const menuLinkMap = new Map();

  $$(".header__link[data-nav-link]", header).forEach((link) => {
    menuLinkMap.set(link.dataset.navLink, link);
  });

  const setActiveNav = (sectionId) => {
    // Gộp gallery vào nhóm "Không gian" (features) để giữ mạch điều hướng
    const normalizedId = sectionId === "gallery" ? "features" : sectionId;
    menuLinkMap.forEach((link, key) => {
      link.classList.toggle("is-active", key === normalizedId);
    });
  };

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
  }
}
// END: header

// START: hero
function initHero() {
  const statusBox = $("#hero-status");
  const statusText = $("#hero-status-text");

  if (!statusBox || !statusText) return;

  const parseTimeToMinutes = (timeStr) => {
    const [hours = "0", minutes = "0"] = String(timeStr).split(":");
    return Number(hours) * 60 + Number(minutes);
  };

  const updateOpenStatus = () => {
    const openTimeStr = CONFIG.openTime || "07:00";
    const closeTimeStr = CONFIG.closeTime || "11:00";

    // Lấy giờ hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === "hour")?.value || "00";
    const minutePart = parts.find((p) => p.type === "minute")?.value || "00";

    const currentMinutes = Number(hourPart) * 60 + Number(minutePart);
    const openMinutes = parseTimeToMinutes(openTimeStr);
    const closeMinutes = parseTimeToMinutes(closeTimeStr);

    let isOpen = false;
    if (openMinutes <= closeMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
      // Trường hợp quán mở xuyên đêm
      isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }

    statusBox.classList.toggle("is-open", isOpen);
    statusBox.classList.toggle("is-closed", !isOpen);
    statusText.textContent = isOpen
      ? `Đang mở cửa · đến ${closeTimeStr}`
      : `Đã đóng cửa · mở lúc ${openTimeStr}`;
  };

  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);
}
// END: hero

// START: about
function initAbout() {
  const aboutSection = $("#about");
  if (!aboutSection) return;

  // Đảm bảo ảnh trong khu vực about luôn được gắn fallback nếu chưa có ảnh thật
  initImageFallback(aboutSection);

  const statElements = $$(".about__stat-num[data-count]", aboutSection);
  if (statElements.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const formatStatValue = (value, suffix = "") =>
    `${Math.round(value)}${suffix}`;

  const setFinalValues = () => {
    statElements.forEach((el) => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      el.textContent = formatStatValue(target, suffix);
    });
  };

  // Tắt hiệu ứng đếm số nếu người dùng bật prefers-reduced-motion hoặc trình duyệt cũ
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    setFinalValues();
    return;
  }

  const animateStat = (el, duration = 1600) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Hàm làm mượt easeOutQuart giúp số chạy nhanh lúc đầu và chậm dần ở cuối
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = target * easedProgress;

      el.textContent = formatStatValue(currentValue, suffix);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatStatValue(target, suffix);
      }
    };

    requestAnimationFrame(step);
  };

  // Đặt giá trị khởi đầu về 0 trước khi người dùng cuộn tới
  statElements.forEach((el) => {
    const suffix = el.dataset.suffix || "";
    el.textContent = formatStatValue(0, suffix);
  });

  const statsContainer = $("#about-stats", aboutSection) || aboutSection;
  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statElements.forEach((el) => animateStat(el));
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 },
  );

  observer.observe(statsContainer);
}
// END: about

// START: menu-data
const MENU_CATEGORIES = [
  { id: "all", name: "Tất cả" },
  { id: "ca-phe", name: "Cà phê" },
  { id: "tra-trai-cay", name: "Trà & trái cây" },
  { id: "da-xay", name: "Đá xay" },
  { id: "sua-chua", name: "Sữa chua" },
];

// TODO: Thay đổi tên món, giá bán, mô tả và bổ sung ảnh thật vào thư mục images/menu/
const MENU_ITEMS = [
  {
    id: "bac-xiu-kem-muoi",
    name: "Bạc Xỉu Kem Muối",
    category: "ca-phe",
    price: 20000,
    desc: "Espresso rang vừa quyện sữa tươi thanh nhẹ và lớp kem muối biển béo mặn dịu.",
    image: "images/menu/bac-xiu-kem-muoi.jpg",
    tag: "best-seller",
  },
  {
    id: "ca-phe-sua",
    name: "Cà Phê Sữa",
    category: "ca-phe",
    price: 15000,
    desc: "Hạt Robusta Đắk Lắk hái chín pha phin truyền thống.",
    image: "images/menu/ca-phe-sua.jpg",
    tag: "",
  },
  {
    id: "o-long-hat-sen",
    name: "Trà Ô Long Hạt Sen",
    category: "tra-trai-cay",
    price: 35000,
    desc: "Nền trà Ô Long nướng thơm dịu nấu cùng hạt sen siêu bùi, siêu giòn ngọt.",
    image: "images/menu/o-long-hat-sen.jpg",
    tag: "best-seller",
  },
  {
    id: "tra-dao-cam-sa",
    name: "Trà Đào Cam Sả Tươi",
    category: "tra-trai-cay",
    price: 27000,
    desc: "Trà đen ủ lạnh phối cùng nước cam vàng, sả đập dập và những lát đào ngâm giòn mát.",
    image: "images/menu/tra-dao-cam-sa.jpg",
    tag: "",
  },
  {
    id: "tra-oi-hong-hat-chia",
    name: "Trà Ổi Hồng Hạt Chia",
    category: "tra-trai-cay",
    price: 27000,
    desc: "Trà lài thanh khiết lắc cùng mứt ổi hồng tự sên, ít ngọt và giàu vitamin tự nhiên.",
    image: "images/menu/tra-oi-hong-hat-chia.jpg",
    tag: "new",
  },
  {
    id: "matcha-uji-da-xay",
    name: "Matcha Uji Đá Xay",
    category: "da-xay",
    price: 35000,
    desc: "Bột trà xanh Uji Nhật Bản xay mịn cùng sữa tươi thanh trùng và lớp kem whipping nhẹ.",
    image: "images/menu/matcha-uji-da-xay.jpg",
    tag: "best-seller",
  },
  {
    id: "ca-phe-dua-da-xay",
    name: "Cà Phê Cốt Dừa Đá Xay",
    category: "da-xay",
    price: 40000,
    desc: "Cốt dừa Bến Tre béo ngậy xay tuyết mịn, rưới sốt Espresso đậm đặc và dừa khô giòn.",
    image: "images/menu/ca-phe-dua-da-xay.jpg",
    tag: "",
  },
  {
    id: "sua-chua-viet-quat",
    name: "Sữa Chua Việt Quất",
    category: "sua-chua",
    price: 25000,
    desc: "Sữa chua béo mịn kết hợp cùng vị việt quất thanh ngọt, chua nhẹ, tạo nên hương vị dịu dàng và sảng khoái.",
    image: "images/menu/sua-chua-viet-quat.jpg",
    tag: "best-seller",
  },
  {
    id: "sua-chua-dau",
    name: "Sữa Chua Dâu",
    category: "sua-chua",
    price: 25000,
    desc: "Sữa chua mịn mát hòa quyện cùng vị dâu tây chua ngọt tự nhiên, mang đến cảm giác tươi mới và đầy hấp dẫn.",
    image: "images/menu/sua-chua-dau.jpg",
    tag: "",
  },
];
// END: menu-data

// START: menu
function initMenu() {
  const tabsContainer = $("#menu-tabs");
  const gridContainer = $("#menu-grid");

  if (!tabsContainer || !gridContainer) return;

  let activeCategory = MENU_CATEGORIES[0]?.id || "all";
  let filterTimer = null;

  const TAG_LABELS = {
    "best-seller": "Best seller",
    new: "Mới",
  };

  // Đếm số lượng món trong từng nhóm
  const getCategoryCount = (catId) => {
    if (catId === "all") return MENU_ITEMS.length;
    return MENU_ITEMS.filter((item) => item.category === catId).length;
  };

  // Render thanh tab lọc từ MENU_CATEGORIES
  const renderTabs = () => {
    tabsContainer.innerHTML = MENU_CATEGORIES.map((cat) => {
      const isSelected = cat.id === activeCategory;
      const count = getCategoryCount(cat.id);
      return `
        <button
          type="button"
          class="menu__tab"
          role="tab"
          id="menu-tab-${cat.id}"
          data-category="${cat.id}"
          aria-selected="${isSelected ? "true" : "false"}"
          aria-controls="menu-grid"
          tabindex="${isSelected ? "0" : "-1"}"
        >
          <span>${cat.name}</span>
          <span class="menu__tab-count" aria-label="${count} món">${count}</span>
        </button>
      `;
    }).join("");
  };

  // Tạo HTML cho 1 thẻ món
  const createCardHTML = (item) => {
    const badgeLabel = TAG_LABELS[item.tag] || "";
    const badgeHTML = badgeLabel
      ? `<span class="menu-card__badge menu-card__badge--${item.tag}">${badgeLabel}</span>`
      : "";

    return `
      <article class="menu-card" data-id="${item.id}" data-category="${item.category}">
        <div class="menu-card__media">
          ${badgeHTML}
          <span class="menu-card__fallback-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
              <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path>
              <path d="M6 2v3"></path>
              <path d="M10 2v3"></path>
              <path d="M14 2v3"></path>
            </svg>
          </span>
          <!-- TODO: thay ảnh thật tại ${item.image} -->
          <img
            src="${item.image}"
            alt="${item.name} – ${item.desc}"
            class="menu-card__img"
            width="400"
            height="300"
            loading="lazy"
          >
        </div>
        <div class="menu-card__body">
          <div class="menu-card__top">
            <h3 class="menu-card__title">${item.name}</h3>
            <span class="menu-card__price">${formatPrice(item.price)}</span>
          </div>
          <p class="menu-card__desc">${item.desc}</p>
        </div>
      </article>
    `;
  };

  // Render lưới món theo nhóm đang chọn
  const renderGrid = (categoryId) => {
    const filteredItems =
      categoryId === "all"
        ? MENU_ITEMS
        : MENU_ITEMS.filter((item) => item.category === categoryId);

    gridContainer.setAttribute("aria-labelledby", `menu-tab-${categoryId}`);

    if (filteredItems.length === 0) {
      gridContainer.innerHTML = `
        <div class="menu__empty">
          <p class="menu__empty-title">Nhóm món này đang được cập nhật</p>
          <p>Tâm Hoa đang thử nghiệm công thức mới cho mục này, bạn vui lòng xem các nhóm món khác nhé.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filteredItems.map(createCardHTML).join("");
    initImageFallback(gridContainer);
  };

  // Đổi nhóm món kèm chuyển cảnh nhẹ
  const selectCategory = (categoryId, focusTab = false) => {
    if (!MENU_CATEGORIES.some((cat) => cat.id === categoryId)) return;
    activeCategory = categoryId;

    const tabs = $$(".menu__tab", tabsContainer);
    tabs.forEach((tab) => {
      const isMatch = tab.dataset.category === categoryId;
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
      tab.setAttribute("tabindex", isMatch ? "0" : "-1");
      if (isMatch) {
        if (focusTab) tab.focus();
        tab.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    });

    if (filterTimer) clearTimeout(filterTimer);
    gridContainer.classList.add("is-filtering");
    gridContainer.setAttribute("aria-busy", "true");

    filterTimer = setTimeout(() => {
      renderGrid(categoryId);
      gridContainer.classList.remove("is-filtering");
      gridContainer.setAttribute("aria-busy", "false");
    }, 150);
  };

  // Sự kiện click chọn tab
  tabsContainer.addEventListener("click", (event) => {
    const tabBtn = event.target.closest(".menu__tab");
    if (!tabBtn) return;
    const nextCat = tabBtn.dataset.category;
    if (nextCat && nextCat !== activeCategory) {
      selectCategory(nextCat, false);
    }
  });

  // Hỗ trợ điều hướng tab bằng phím mũi tên Trái / Phải / Home / End
  tabsContainer.addEventListener("keydown", (event) => {
    const tabs = $$(".menu__tab", tabsContainer);
    const currentIndex = tabs.findIndex(
      (t) => t.dataset.category === activeCategory,
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const targetCategory = tabs[nextIndex].dataset.category;
    selectCategory(targetCategory, true);
  });

  // Khởi tạo lần đầu
  renderTabs();
  renderGrid(activeCategory);
}
// END: menu

// START: features
function initFeatures() {
  // Khu vực features hiển thị tĩnh bằng CSS Grid, không cần xử lý JS bổ sung
}
// END: features

// START: gallery
function initGallery() {
  const gallerySection = $("#gallery");
  const grid = $("#gallery-grid");
  const lightbox = $("#gallery-lightbox");

  if (!gallerySection || !grid || !lightbox) return;

  initImageFallback(gallerySection);

  const closeBtn = $("#gallery-lightbox-close", lightbox);
  const prevBtn = $("#gallery-lightbox-prev", lightbox);
  const nextBtn = $("#gallery-lightbox-next", lightbox);
  const lightboxImg = $("#gallery-lightbox-img", lightbox);
  const lightboxCaption = $("#gallery-lightbox-caption", lightbox);
  const lightboxCounter = $("#gallery-lightbox-counter", lightbox);

  let currentIndex = 0;
  let lastTriggerEl = null;

  // Đọc danh sách ảnh trực tiếp từ các phần tử trong lưới HTML
  const getGalleryItems = () => $$(".gallery__item", grid);

  // Cập nhật nội dung ảnh và chú thích trong Lightbox
  const updateLightboxSlide = (index) => {
    const items = getGalleryItems();
    const total = items.length;
    if (total === 0) return;

    currentIndex = (index + total) % total;
    const targetItem = items[currentIndex];
    const imgEl = $("img", targetItem);

    const src = imgEl ? imgEl.getAttribute("src") : "";
    const alt = imgEl ? imgEl.getAttribute("alt") : "";
    const caption = targetItem.dataset.caption || alt || "";

    if (lightboxImg) {
      lightboxImg.classList.remove("is-broken");
      lightboxImg.src = src;
      lightboxImg.alt = alt;
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${total}`;
    }
  };

  // Xử lý khi ảnh trong Lightbox bị lỗi hoặc chưa có file ảnh thật
  if (lightboxImg) {
    lightboxImg.addEventListener("error", () => {
      lightboxImg.classList.add("is-broken");
    });
    lightboxImg.addEventListener("load", () => {
      lightboxImg.classList.remove("is-broken");
    });
  }

  // Mở Lightbox
  const openLightbox = (index, triggerEl) => {
    lastTriggerEl = triggerEl || document.activeElement;
    updateLightboxSlide(index);
    document.body.classList.add("is-lightbox-open");

    if (typeof lightbox.showModal === "function") {
      if (!lightbox.open) lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }

    if (closeBtn) closeBtn.focus();
  };

  // Đóng Lightbox và trả focus về đúng ảnh vừa bấm
  const closeLightbox = () => {
    if (!lightbox.open && !lightbox.hasAttribute("open")) return;

    if (typeof lightbox.close === "function") {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }

    document.body.classList.remove("is-lightbox-open");

    if (lastTriggerEl && typeof lastTriggerEl.focus === "function") {
      lastTriggerEl.focus();
    }
  };

  // Bấm vào ô ảnh bất kỳ trong lưới để mở Lightbox
  grid.addEventListener("click", (event) => {
    const item = event.target.closest(".gallery__item");
    if (!item) return;

    const items = getGalleryItems();
    const index = items.indexOf(item);
    if (index !== -1) {
      openLightbox(index, item);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () =>
      updateLightboxSlide(currentIndex - 1),
    );
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () =>
      updateLightboxSlide(currentIndex + 1),
    );
  }

  // Đóng khi người dùng bấm ra vùng nền ngoài khung ảnh
  lightbox.addEventListener("click", (event) => {
    const stage = $("#gallery-lightbox-stage", lightbox);
    const inner = $("#gallery-lightbox-inner", lightbox);
    if (
      event.target === lightbox ||
      event.target === inner ||
      event.target === stage
    ) {
      closeLightbox();
    }
  });

  // Đồng bộ mở khóa cuộn trang và trả focus khi đóng bằng phím ESC mặc định của <dialog>
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("is-lightbox-open");
    if (lastTriggerEl && typeof lastTriggerEl.focus === "function") {
      lastTriggerEl.focus();
    }
  });

  // Điều hướng ảnh trước/sau bằng phím mũi tên Trái/Phải và đóng bằng ESC
  document.addEventListener("keydown", (event) => {
    const isOpen = lightbox.open || lightbox.hasAttribute("open");
    if (!isOpen) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateLightboxSlide(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      updateLightboxSlide(currentIndex + 1);
    } else if (event.key === "Escape") {
      closeLightbox();
    }
  });
}
// END: gallery

// START: reviews
function initReviews() {
  // Khu vực reviews sử dụng CSS scroll-snap tự nhiên trên mobile và Grid 3 cột trên desktop
}
// END: reviews

// START: promo
function initPromo() {
  const promoSection = $("#promo");
  if (!promoSection) return;

  // Đảm bảo ảnh ưu đãi hiển thị nền dự phòng nếu chưa có file images/promo.jpg
  initImageFallback(promoSection);
}
// END: promo

// START: booking
/**
 * HƯỚNG DẪN TÍCH HỢP NHẬN ĐƠN Booking TỰ ĐỘNG (FORMSPREE HOẶC GOOGLE APPS SCRIPT):
 *
 *Dùng Formspree (Nhanh nhất – nhận thông báo qua Email)
 *   Bước 1: Truy cập https://formspree.io/, tạo tài khoản miễn phí và nhấn "+ New Form".
 *   Bước 2: Copy đường dẫn Endpoint có dạng "https://formspree.io/f/xxxxxxxx".
 *   Bước 3: Dán đường dẫn đó vào thuộc tính `bookingEndpoint` trong đối tượng CONFIG ở đầu file script.js.
 *
 * CÁCH 2: Dùng Google Apps Script (Lưu tự động vào Google Sheets miễn phí)
 *   Bước 1: Tạo 1 file Google Sheet mới, đặt tên các cột ở dòng 1: Thời gian gửi | Họ tên | SĐT | Ngày | Giờ | Số người | Ghi chú.
 *   Bước 2: Trên thanh menu Google Sheet, chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 *   Bước 3: Dán đoạn mã xử lý hàm `doPost(e)` bên dưới vào rồi bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới":
 *     function doPost(e) {
 *       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *       var data = JSON.parse(e.postData.contents);
 *       sheet.appendRow([new Date(), data.name, data.phone, data.date, data.time, data.guests, data.notes]);
 *       return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
 *     }
 *   Bước 4: Chọn loại "Ứng dụng web" (Web App), mục Quyền truy cập chọn "Bất kỳ ai" (Anyone), sau đó copy URL Web App.
 *   Bước 5: Dán URL Web App vừa copy vào `CONFIG.bookingEndpoint` ở đầu file script.js.
 */

/**
 * Gửi dữ liệu Booking tới CONFIG.bookingEndpoint (nếu có cấu hình)
 * @param {Object} payload
 * @returns {Promise<{sent: boolean, error?: string}>}
 */
async function sendToEndpoint(payload) {
  const endpoint = (CONFIG.bookingEndpoint || "").trim();
  if (!endpoint) {
    return { sent: false };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error:
        "Không thể kết nối máy chủ tự động, bạn vui lòng gửi tin nhắn qua Zalo bên dưới để quán giữ bàn ngay nhé.",
    };
  }
}

function initBooking() {
  const bookingSection = $("#booking");
  const form = $("#booking-form");
  const successBox = $("#booking-success");

  if (!bookingSection || !form || !successBox) return;

  const nameInput = $("#booking-name", form);
  const phoneInput = $("#booking-phone", form);
  const dateInput = $("#booking-date", form);
  const timeSelect = $("#booking-time", form);
  const guestsInput = $("#booking-guests", form);
  const notesInput = $("#booking-notes", form);
  const honeypotInput = $("#booking-website", form);
  const submitBtn = $("#booking-submit", form);
  const submitText = $("#booking-submit-text", form);
  const formAlert = $("#booking-form-alert", form);

  const summaryList = $("#booking-summary", successBox);
  const endpointStatus = $("#booking-endpoint-status", successBox);
  const messageTextarea = $("#booking-message-text", successBox);
  const copyBtn = $("#booking-copy-btn", successBox);
  const copyText = $("#booking-copy-text", successBox);
  const zaloBtn = $("#booking-zalo-btn", successBox);
  const callBtn = $("#booking-call-btn", successBox);
  const resetBtn = $("#booking-reset-btn", successBox);
  const inlinePhone = $("#booking-inline-phone", bookingSection);

  // Đồng bộ SĐT và Zalo từ CONFIG vào các nút liên hệ
  const cleanPhone = (CONFIG.phone || "0352044431").replace(/\s+/g, "");
  const cleanZalo = (CONFIG.zalo || cleanPhone).replace(/\s+/g, "");
  if (zaloBtn) zaloBtn.href = `https://zalo.me/${cleanZalo}`;
  if (callBtn) callBtn.href = `tel:${cleanPhone}`;
  if (inlinePhone) {
    inlinePhone.href = `tel:${cleanPhone}`;
    inlinePhone.textContent =
      CONFIG.phoneDisplay || CONFIG.phone || "0352044431";
  }

  // Lấy ngày & giờ hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
  const getVNNow = () => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    const todayISO = `${map.year}-${map.month}-${map.day}`;
    const currentMinutes = Number(map.hour || 0) * 60 + Number(map.minute || 0);
    return { todayISO, currentMinutes };
  };

  const parseTimeToMinutes = (str) => {
    const [h = "0", m = "0"] = String(str).split(":");
    return Number(h) * 60 + Number(m);
  };

  const minutesToHHMM = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatVNDate = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  // Sinh các khung giờ cách nhau 30 phút từ CONFIG.openTime đến CONFIG.closeTime
  const populateTimeSlots = (preserveValue = true) => {
    const { todayISO, currentMinutes } = getVNNow();
    const openMins = parseTimeToMinutes(CONFIG.openTime || "07:00");
    const closeMins = parseTimeToMinutes(CONFIG.closeTime || "11:00");
    const selectedDate = dateInput.value;
    const prevValue = preserveValue ? timeSelect.value : "";

    const slots = [];
    for (let mins = openMins; mins <= closeMins; mins += 30) {
      // Nếu chọn ngày hôm nay thì ẩn các khung giờ đã qua
      if (selectedDate === todayISO && mins <= currentMinutes) {
        continue;
      }
      slots.push(minutesToHHMM(mins));
    }

    if (slots.length === 0) {
      timeSelect.innerHTML = `<option value="">Đã qua giờ nhận bàn hôm nay (chọn ngày khác)</option>`;
      timeSelect.value = "";
      return;
    }

    const optionsHTML = [
      `<option value="">Chọn giờ đến</option>`,
      ...slots.map((slot) => `<option value="${slot}">${slot}</option>`),
    ].join("");

    timeSelect.innerHTML = optionsHTML;

    if (prevValue && slots.includes(prevValue)) {
      timeSelect.value = prevValue;
    } else {
      timeSelect.value = slots[0];
    }
  };

  // Khởi tạo ngày mặc định (không cho chọn ngày quá khứ)
  const initDateAndTime = () => {
    const { todayISO, currentMinutes } = getVNNow();
    const closeMins = parseTimeToMinutes(CONFIG.closeTime || "11:00");

    dateInput.min = todayISO;

    // Nếu hiện tại vẫn còn khung giờ trong ngày thì mặc định chọn hôm nay, nếu đã đóng cửa thì gợi ý ngày mai
    if (currentMinutes < closeMins) {
      dateInput.value = todayISO;
    } else {
      const tomorrow = new Date(Date.now() + 86400000);
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      dateInput.value = formatter.format(tomorrow);
    }

    populateTimeSlots(false);
  };

  initDateAndTime();

  dateInput.addEventListener("change", () => {
    populateTimeSlots(true);
    validateField("date");
    if (timeSelect.getAttribute("aria-invalid") === "true") {
      validateField("time");
    }
  });

  // Hiển thị hoặc xóa thông báo lỗi của từng trường
  const setFieldError = (fieldName, message) => {
    const inputEl = $(`#booking-${fieldName}`, form);
    const errorEl = $(`#booking-${fieldName}-error`, form);
    const wrapEl = $(`#field-wrap-${fieldName}`, form);

    if (!inputEl || !errorEl) return;

    const hasError = Boolean(message);
    inputEl.setAttribute("aria-invalid", hasError ? "true" : "false");
    errorEl.textContent = message || "";
    if (wrapEl) {
      wrapEl.classList.toggle("has-error", hasError);
    }
  };

  // Kiểm tra tính hợp lệ của từng trường
  const validateField = (fieldName) => {
    const { todayISO, currentMinutes } = getVNNow();
    const openMins = parseTimeToMinutes(CONFIG.openTime || "07:00");
    const closeMins = parseTimeToMinutes(CONFIG.closeTime || "11:00");

    if (fieldName === "name") {
      const val = nameInput.value.trim();
      if (!val) {
        setFieldError("name", "Vui lòng nhập họ và tên của bạn.");
        return false;
      }
      if (val.length < 2) {
        setFieldError("name", "Họ và tên cần có ít nhất 2 ký tự.");
        return false;
      }
      setFieldError("name", "");
      return true;
    }

    if (fieldName === "phone") {
      const raw = phoneInput.value.trim();
      const normalized = raw.replace(/[\s.-]/g, "");
      const vnPhoneRegex = /^(0\d{9}|\+84\d{9})$/;

      if (!normalized) {
        setFieldError("phone", "Vui lòng nhập số điện thoại liên hệ.");
        return false;
      }
      if (!vnPhoneRegex.test(normalized)) {
        setFieldError(
          "phone",
          "Số điện thoại chưa đúng định dạng (ví dụ: 0352044431 hoặc +84909123456).",
        );
        return false;
      }
      setFieldError("phone", "");
      return true;
    }

    if (fieldName === "date") {
      const val = dateInput.value;
      if (!val) {
        setFieldError("date", "Vui lòng chọn ngày bạn ghé quán.");
        return false;
      }
      if (val < todayISO) {
        setFieldError("date", "Ngày Booking không được nằm trong quá khứ.");
        return false;
      }
      setFieldError("date", "");
      return true;
    }

    if (fieldName === "time") {
      const val = timeSelect.value;
      if (!val) {
        setFieldError("time", "Vui lòng chọn khung giờ còn trống.");
        return false;
      }
      const chosenMins = parseTimeToMinutes(val);
      if (chosenMins < openMins || chosenMins > closeMins) {
        setFieldError(
          "time",
          `Quán mở cửa từ ${CONFIG.openTime} đến ${CONFIG.closeTime}.`,
        );
        return false;
      }
      if (dateInput.value === todayISO && chosenMins <= currentMinutes) {
        setFieldError(
          "time",
          "Khung giờ này đã qua, vui lòng chọn giờ muộn hơn.",
        );
        return false;
      }
      setFieldError("time", "");
      return true;
    }

    if (fieldName === "guests") {
      const raw = guestsInput.value.trim();
      const num = Number(raw);
      if (!raw || !Number.isInteger(num) || num < 1 || num > 20) {
        setFieldError("guests", "Số lượng khách hợp lệ từ 1 đến 20 người.");
        return false;
      }
      setFieldError("guests", "");
      return true;
    }

    return true;
  };

  const fieldsOrder = ["name", "phone", "date", "time", "guests"];

  // Kiểm tra khi người dùng rời khỏi ô (blur) và xóa lỗi ngay khi đang sửa (input/change)
  fieldsOrder.forEach((fieldName) => {
    const inputEl = $(`#booking-${fieldName}`, form);
    if (!inputEl) return;

    inputEl.addEventListener("blur", () => validateField(fieldName));
    const liveEvent = inputEl.tagName === "SELECT" ? "change" : "input";
    inputEl.addEventListener(liveEvent, () => {
      if (inputEl.getAttribute("aria-invalid") === "true") {
        validateField(fieldName);
      }
    });
  });

  // Hiển thị khối xác nhận sau khi gửi thành công
  const renderConfirmation = (data, endpointResult) => {
    const formattedDate = formatVNDate(data.date);
    const notesDisplay = data.notes ? data.notes : "Không có ghi chú thêm";

    summaryList.innerHTML = `
      <div class="booking__summary-item">
        <dt class="booking__summary-label">Khách đặt</dt>
        <dd class="booking__summary-value"></dd>
      </div>
      <div class="booking__summary-item">
        <dt class="booking__summary-label">Số điện thoại</dt>
        <dd class="booking__summary-value"></dd>
      </div>
      <div class="booking__summary-item">
        <dt class="booking__summary-label">Thời gian</dt>
        <dd class="booking__summary-value"></dd>
      </div>
      <div class="booking__summary-item">
        <dt class="booking__summary-label">Số lượng khách</dt>
        <dd class="booking__summary-value"></dd>
      </div>
      <div class="booking__summary-item booking__summary-item--full">
        <dt class="booking__summary-label">Ghi chú</dt>
        <dd class="booking__summary-value"></dd>
      </div>
    `;

    const ddElements = $$(".booking__summary-value", summaryList);
    if (ddElements[0]) ddElements[0].textContent = data.name;
    if (ddElements[1]) ddElements[1].textContent = data.phone;
    if (ddElements[2])
      ddElements[2].textContent = `${data.time} · Ngày ${formattedDate}`;
    if (ddElements[3]) ddElements[3].textContent = `${data.guests} người`;
    if (ddElements[4]) ddElements[4].textContent = notesDisplay;

    // Soạn tin nhắn lịch sự, đầy đủ thông tin để khách sao chép gửi Zalo
    const noteSentence = data.notes ? `\n- Ghi chú: ${data.notes}` : "";
    const composedMessage =
      `Chào ${CONFIG.name}, mình muốn Booking trước với thông tin sau:\n` +
      `- Họ tên: ${data.name}\n` +
      `- SĐT: ${data.phone}\n` +
      `- Thời gian: ${data.time} ngày ${formattedDate}\n` +
      `- Số khách: ${data.guests} người${noteSentence}\n` +
      `Nhờ quán xác nhận giúp mình nhé. Cảm ơn quán!`;

    messageTextarea.value = composedMessage;

    if (endpointStatus) {
      if (endpointResult.sent) {
        endpointStatus.textContent =
          "Hệ thống đã nhận yêu cầu của bạn. Bạn có thể nhắn thêm qua Zalo nếu cần hỗ trợ nhanh.";
      } else if (endpointResult.error) {
        endpointStatus.textContent = endpointResult.error;
      } else {
        endpointStatus.textContent =
          "Bạn hãy sao chép tin nhắn bên dưới và gửi qua Zalo để quán xác nhận bàn nhanh nhất.";
      }
    }

    form.hidden = true;
    successBox.hidden = false;
    successBox.focus();
  };

  // Xử lý sự kiện submit form
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Chống spam bằng honeypot: nếu bot tự điền ô ẩn thì dừng âm thầm
    if (honeypotInput && honeypotInput.value.trim() !== "") {
      return;
    }

    if (formAlert) {
      formAlert.hidden = true;
      formAlert.textContent = "";
    }

    let firstInvalidField = null;
    fieldsOrder.forEach((fieldName) => {
      const isValid = validateField(fieldName);
      if (!isValid && !firstInvalidField) {
        firstInvalidField = $(`#booking-${fieldName}`, form);
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    const bookingData = {
      shopName: CONFIG.name,
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim().replace(/[\s.-]/g, ""),
      date: dateInput.value,
      time: timeSelect.value,
      guests: Number(guestsInput.value),
      notes: notesInput.value.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Hiển thị trạng thái đang gửi nếu có cấu hình endpoint
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    if (submitText) submitText.textContent = "Đang ghi nhận yêu cầu...";

    const endpointResult = await sendToEndpoint(bookingData);

    submitBtn.disabled = false;
    submitBtn.classList.remove("is-loading");
    if (submitText) submitText.textContent = "Gửi yêu cầu Booking";

    renderConfirmation(bookingData, endpointResult);
  });

  // Nút "Sao chép tin nhắn"
  if (copyBtn && messageTextarea) {
    copyBtn.addEventListener("click", async () => {
      const textToCopy = messageTextarea.value;
      let copied = false;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        messageTextarea.focus();
        messageTextarea.select();
        try {
          copied = document.execCommand("copy");
        } catch {
          copied = false;
        }
      }

      if (copyText) {
        copyText.textContent = copied
          ? "Đã sao chép tin nhắn ✓"
          : "Hãy bôi đen ô trên để chép";
        setTimeout(() => {
          copyText.textContent = "Sao chép tin nhắn";
        }, 1500);
      }
    });
  }

  // Nút "Booking khác" quay về form
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      initDateAndTime();
      fieldsOrder.forEach((fieldName) => setFieldError(fieldName, ""));
      successBox.hidden = true;
      form.hidden = false;
      nameInput.focus();
    });
  }
}
// END: booking

// START: contact
function initContact() {
  const contactSection = $("#contact");
  if (!contactSection) return;

  const addressEl = $("#contact-address", contactSection);
  const hoursEl = $("#contact-hours", contactSection);
  const phoneEl = $("#contact-phone", contactSection);
  const zaloBtn = $("#contact-zalo-btn", contactSection);
  const directionsBtn = $("#contact-directions-btn", contactSection);
  const socialLinks = $$("[data-social]", contactSection);

  const cleanPhone = (CONFIG.phone || "0352044431").replace(/\s+/g, "");
  const cleanZalo = (CONFIG.zalo || cleanPhone).replace(/\s+/g, "");
  const mapsQuery = CONFIG.mapsQuery || CONFIG.address || "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  if (addressEl && CONFIG.address) {
    addressEl.textContent = CONFIG.address;
  }

  if (hoursEl) {
    hoursEl.textContent = `${CONFIG.openTime || "07:00"} – ${CONFIG.closeTime || "11:00"} mỗi ngày (Kể cả Lễ & Cuối tuần)`;
  }

  if (phoneEl) {
    phoneEl.href = `tel:${cleanPhone}`;
    phoneEl.textContent = CONFIG.phoneDisplay || CONFIG.phone || "0352044431";
  }

  if (zaloBtn) {
    zaloBtn.href = `https://zalo.me/${cleanZalo}`;
  }

  if (directionsBtn) {
    directionsBtn.href = mapsUrl;
  }

  if (CONFIG.socials) {
    socialLinks.forEach((link) => {
      const platform = link.dataset.social;
      if (platform && CONFIG.socials[platform]) {
        link.href = CONFIG.socials[platform];
      }
    });
  }
}
// END: contact

// START: footer
function initFooter() {
  const footer = $("#footer");
  if (!footer) return;

  const brandNameEl = $("#footer-brand-name", footer);
  const copyNameEl = $("#footer-copy-name", footer);
  const sloganEl = $("#footer-slogan", footer);
  const hoursEl = $("#footer-hours", footer);
  const yearEl = $("#footer-year", footer);
  const socialLinks = $$("[data-social]", footer);

  if (brandNameEl && CONFIG.name) {
    brandNameEl.textContent = CONFIG.name;
  }

  if (copyNameEl && CONFIG.name) {
    copyNameEl.textContent = CONFIG.name;
  }

  if (sloganEl && CONFIG.slogan) {
    sloganEl.textContent = CONFIG.slogan;
  }

  if (hoursEl) {
    hoursEl.textContent = `Mở cửa: ${CONFIG.openTime || "07:00"} – ${CONFIG.closeTime || "11:00"} mỗi ngày`;
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  if (CONFIG.socials) {
    socialLinks.forEach((link) => {
      const platform = link.dataset.social;
      if (platform && CONFIG.socials[platform]) {
        link.href = CONFIG.socials[platform];
      }
    });
  }
}
// END: footer

// START: floating
function initFloating() {
  const floating = $("#floating");
  if (!floating) return;

  const backToTopBtn = $("#back-to-top", floating);
  const callBtn = $("#floating-call", floating);
  const zaloBtn = $("#floating-zalo", floating);
  const mapBtn = $("#floating-map", floating);

  const cleanPhone = (CONFIG.phone || "0352044431").replace(/\s+/g, "");
  const cleanZalo = (CONFIG.zalo || cleanPhone).replace(/\s+/g, "");
  const mapsQuery = CONFIG.mapsQuery || CONFIG.address || "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  if (callBtn) callBtn.href = `tel:${cleanPhone}`;
  if (zaloBtn) zaloBtn.href = `https://zalo.me/${cleanZalo}`;
  if (mapBtn) mapBtn.href = mapsUrl;

  if (!backToTopBtn) return;

  const toggleBackToTop = () => {
    if (window.scrollY > 600) {
      backToTopBtn.classList.add("is-visible");
    } else {
      backToTopBtn.classList.remove("is-visible");
    }
  };

  toggleBackToTop();
  window.addEventListener("scroll", toggleBackToTop, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}
// END: floating

// START: effects
function initEffects() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Nếu người dùng bật chế độ giảm chuyển động hoặc trình duyệt không hỗ trợ IntersectionObserver:
  // Không gắn class .js ẩn phần tử, giữ nguyên toàn bộ nội dung hiển thị ngay lập tức
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    document.documentElement.classList.remove("js");
    $$(".reveal").forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  // Đánh dấu JS đã chạy để CSS kích hoạt trạng thái chuẩn bị cho .reveal
  document.documentElement.classList.add("js");

  // Các nhóm phần tử tự động áp dụng hiệu ứng hiện dần (tiêu đề, thẻ, ảnh, khối nội dung)
  // Hỗ trợ cả các phần tử bạn tự gắn sẵn class="reveal" trong HTML
  const revealGroups = [
    ".hero__meta, .hero__title, .hero__desc, .hero__actions, .hero__highlights",
    ".section__eyebrow, .section__title, .section__desc",
    ".about__media, .about__story, .about__quote, .about__stat-item",
    ".menu__tabs-wrap, .menu-card, .menu__footer",
    ".feature-card",
    ".gallery__item",
    ".review-card",
    ".promo__banner",
    ".booking__benefit-item, .booking__quick-help, .booking__card",
    ".contact__item, .contact__actions, .contact__socials-wrap, .contact__map-wrap",
  ];

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12,
    },
  );

  /**
   * Gắn class .reveal, tính biến --delay xuất hiện lần lượt và đưa vào IntersectionObserver
   * @param {Element[]} elements
   * @param {number} stepMs Khoảng trễ giữa các phần tử liền kề (mặc định 75ms)
   * @param {number} maxItemsPerRow Số phần tử tối đa trong một nhịp trễ
   */
  const registerRevealElements = (
    elements,
    stepMs = 75,
    maxItemsPerRow = 4,
  ) => {
    elements.forEach((el, index) => {
      if (!el || el.dataset.revealBound === "true") return;
      el.dataset.revealBound = "true";
      el.classList.add("reveal");

      // Giữ nguyên nếu trong HTML đã tự đặt sẵn style="--delay: ..."
      if (!el.style.getPropertyValue("--delay")) {
        const delayMs = (index % maxItemsPerRow) * stepMs;
        el.style.setProperty("--delay", `${delayMs}ms`);
      }

      observer.observe(el);
    });
  };

  // 1. Đăng ký các phần tử có sẵn class .reveal trong HTML (nếu có)
  registerRevealElements($$(".reveal"), 75, 4);

  // 2. Đăng ký theo từng section để hiệu ứng --delay tính lần lượt trong phạm vi từng khu vực
  const sections = $$("main section[id]");
  sections.forEach((section) => {
    revealGroups.forEach((selector) => {
      const items = $$(selector, section);
      if (items.length > 0) {
        registerRevealElements(items, 75, 4);
      }
    });
  });

  // 3. Theo dõi #menu-grid bằng MutationObserver để các thẻ .menu-card do JS render lại khi lọc tab
  // luôn nhận được class .reveal và biến --delay mượt mà
  const menuGrid = $("#menu-grid");
  if (menuGrid && "MutationObserver" in window) {
    const menuObserver = new MutationObserver(() => {
      const cards = $$(".menu-card, .menu__empty", menuGrid);
      registerRevealElements(cards, 65, 3);
    });

    menuObserver.observe(menuGrid, { childList: true });
  }
}
// END: effects
