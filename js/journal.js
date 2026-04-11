/**
 * IJID - International Journal of Innovative Discoveries
 * Main JavaScript file for interactive functionality
 */
(function ($) {
  "use strict";

  var toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer && toastContainer.length) return toastContainer;
    toastContainer = $('<div class="ijid-toast-stack" aria-live="polite" aria-atomic="false"></div>');
    $("body").append(toastContainer);
    return toastContainer;
  }

  function showToast(message, type, duration) {
    var safeType = type || "info";
    var safeDuration = duration || 2600;
    var icons = {
      success: "ti-check-box",
      warning: "ti-alert",
      error: "ti-close",
      info: "ti-info-alt",
    };

    var iconClass = icons[safeType] || icons.info;
    var toast = $(
      '<div class="ijid-toast ijid-toast-' +
        safeType +
        '"><i class="' +
        iconClass +
        '"></i><span>' +
        $("<span>").text(message).html() +
        "</span></div>"
    );

    ensureToastContainer().append(toast);
    requestAnimationFrame(function () {
      toast.addClass("is-visible");
    });

    setTimeout(function () {
      toast.removeClass("is-visible");
      setTimeout(function () {
        toast.remove();
      }, 220);
    }, safeDuration);
  }

  function flashButton($button, doneText) {
    if (!$button || !$button.length) return;
    var originalHtml = $button.html();
    $button.addClass("is-loading").prop("disabled", true);
    setTimeout(function () {
      if (doneText) {
        $button.html(doneText);
      }
      $button.removeClass("is-loading").prop("disabled", false);
      setTimeout(function () {
        $button.html(originalHtml);
      }, 900);
    }, 700);
  }

  function normalizeHref(href) {
    if (!href || href === "#") return "";
    return href.split("#")[0].split("?")[0].replace(/^\.\//, "");
  }

  function applyActiveNavState() {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";

    $(".menu_nav .nav-item").removeClass("active");
    $(".menu_nav .nav-link, .dashboard-sidebar .nav-menu li a").removeClass("is-current");

    var directMatch = null;
    $(".menu_nav .nav-link, .dashboard-sidebar .nav-menu li a").each(function () {
      var href = normalizeHref($(this).attr("href"));
      if (!href) return;
      if (href === currentPage) {
        directMatch = $(this);
      }
    });

    if (directMatch && directMatch.length) {
      directMatch.addClass("is-current");
      directMatch.closest(".nav-item").addClass("active");
      directMatch.closest(".submenu").addClass("active");
    }
  }

  function ensureSkipLink() {
    if ($(".skip-to-content").length) return;
    var $mainTarget = $("#mainContent");
    if (!$mainTarget.length) {
      $mainTarget = $("main").first();
    }
    if (!$mainTarget.length) {
      $mainTarget = $(".journal_banner, .page-header, .dashboard-area, .auth-section").first();
    }
    if ($mainTarget.length && !$mainTarget.attr("id")) {
      $mainTarget.attr("id", "mainContent");
    }
    if ($mainTarget.length) {
      $("body").prepend('<a class="skip-to-content" href="#' + $mainTarget.attr("id") + '">Skip to content</a>');
    }
  }

  function initScrollTopButton() {
    if ($(".ijid-scroll-top").length) return;
    var $button = $('<button type="button" class="ijid-scroll-top" aria-label="Back to top"><i class="ti-angle-up"></i></button>');
    $("body").append($button);

    $(window).on("scroll", function () {
      if ($(window).scrollTop() > 360) {
        $button.addClass("is-visible");
      } else {
        $button.removeClass("is-visible");
      }
    });

    $button.on("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ========================================
  // Role Selector (Register Page)
  // ========================================
  $(".role-option").on("click", function () {
    $(".role-option").removeClass("active");
    $(this).addClass("active");
    var role = $(this).data("role");
    $("#selectedRole").val(role);
  });

  // ========================================
  // Notification Bell Toggle
  // ========================================
  var $notifDropdown = $(".notification-dropdown, .notifications-dropdown");

  $("#notifBell").on("click", function (e) {
    e.stopPropagation();
    $notifDropdown.toggleClass("show");
  });
  $(document).on("click", function () {
    $notifDropdown.removeClass("show");
  });
  $notifDropdown.on("click", function (e) {
    e.stopPropagation();
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $notifDropdown.removeClass("show");
    }
  });

  // ========================================
  // Markdown Editor Tab Switching
  // ========================================
  $(".editor-btn").on("click", function () {
    $(".editor-btn").removeClass("active");
    $(this).addClass("active");
    var tab = $(this).data("tab");
    if (tab === "write") {
      $("#abstractWrite").show();
      $("#abstractPreview").hide();
    } else if (tab === "preview") {
      $("#abstractWrite").hide();
      $("#abstractPreview").show();
      // Basic markdown-to-HTML preview
      var md = $("#abstractText").val();
      var html = simpleMarkdown(md);
      $("#abstractPreviewContent").html(
        html || '<p class="text-muted">Nothing to preview</p>'
      );
    }
  });

  function simpleMarkdown(text) {
    if (!text) return "";
    var html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Headers
    html = html.replace(/^### (.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^## (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^# (.+)$/gm, "<h3>$1</h3>");
    // Bold & italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Line breaks
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    return "<p>" + html + "</p>";
  }

  // ========================================
  // Tags Input (Submit Paper)
  // ========================================
  var maxTags = 6;
  $("#tagsInput").on("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      var val = $(this).val().trim();
      if (!val) return;
      var container = $("#tagsContainer");
      var currentTags = container.find(".tag-item").length;
      if (currentTags >= maxTags) return;
      // Prevent duplicates
      var exists = false;
      container.find(".tag-item span").each(function () {
        if ($(this).text().toLowerCase() === val.toLowerCase()) exists = true;
      });
      if (exists) return;
      var tag = $(
        '<div class="tag-item"><span>' +
          $("<span>").text(val).html() +
          "</span><button type='button' class='tag-remove'>&times;</button></div>"
      );
      container.find(".tags-input").before(tag);
      $(this).val("");
    }
  });
  $(document).on("click", ".tag-remove", function () {
    $(this).parent(".tag-item").remove();
  });

  // ========================================
  // File Upload – Manuscript
  // ========================================
  $("#manuscriptUpload").on("click", function () {
    $("#manuscriptFile").click();
  });
  $("#manuscriptFile").on("change", function () {
    var file = this.files[0];
    if (file) {
      $("#manuscriptFileName").text(file.name);
      $("#manuscriptFileSize").text(formatBytes(file.size));
      $("#manuscriptFileInfo").show();
      $("#manuscriptUpload").hide();
    }
  });
  $("#removeManuscript").on("click", function () {
    $("#manuscriptFile").val("");
    $("#manuscriptFileInfo").hide();
    $("#manuscriptUpload").show();
  });

  // Drag & drop for manuscript
  $("#manuscriptUpload")
    .on("dragover", function (e) {
      e.preventDefault();
      $(this).addClass("dragover");
    })
    .on("dragleave", function () {
      $(this).removeClass("dragover");
    })
    .on("drop", function (e) {
      e.preventDefault();
      $(this).removeClass("dragover");
      var files = e.originalEvent.dataTransfer.files;
      if (files.length) {
        $("#manuscriptFile")[0].files = files;
        $("#manuscriptFile").trigger("change");
      }
    });

  // ========================================
  // File Upload – Supplementary Files
  // ========================================
  $("#supplementaryUpload").on("click", function () {
    $("#supplementaryFiles").click();
  });
  $("#supplementaryFiles").on("change", function () {
    var files = this.files;
    var list = $("#supplementaryFilesList");
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var item = $(
        '<div class="d-flex align-items-center p-2 mb-1" style="background:#f8f9fa;border-radius:6px;">' +
          '<i class="ti-file mr-2" style="color:var(--ijid-primary);"></i>' +
          '<span class="mr-3">' +
          $("<span>").text(f.name).html() +
          "</span>" +
          '<span class="text-muted mr-auto">' +
          formatBytes(f.size) +
          "</span>" +
          '<button type="button" class="btn btn-sm btn-link text-danger supp-remove"><i class="ti-close"></i></button>' +
          "</div>"
      );
      list.append(item);
    }
  });
  $(document).on("click", ".supp-remove", function () {
    $(this).closest(".d-flex").remove();
  });

  // ========================================
  // Add Co-Author
  // ========================================
  $("#addAuthorBtn").on("click", function () {
    var row = $(
      '<div class="row mb-3 author-row">' +
        '<div class="col-md-4"><input type="text" class="form-control" placeholder="Full Name *" required /></div>' +
        '<div class="col-md-4"><input type="email" class="form-control" placeholder="Email *" required /></div>' +
        '<div class="col-md-3"><input type="text" class="form-control" placeholder="Institution" /></div>' +
        '<div class="col-md-1 d-flex align-items-center"><button type="button" class="btn btn-sm btn-link text-danger remove-author"><i class="ti-close"></i></button></div>' +
        "</div>"
    );
    $("#authorsContainer").append(row);
  });
  $(document).on("click", ".remove-author", function () {
    $(this).closest(".author-row").remove();
  });

  // ========================================
  // Copy Citation
  // ========================================
  $("#copyCitation").on("click", function () {
    var text = $("#citationText").text();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        $("#copyCitation").html('<i class="ti-check"></i> Copied!');
        setTimeout(function () {
          $("#copyCitation").html(
            '<i class="ti-clipboard"></i> Copy Citation'
          );
        }, 2000);
      });
    }
  });

  // Citation format switching
  var citations = {
    apa: 'Chen, S., Liu, W., & Park, T. (2026). Transformer Architecture for Code Generation Tasks. <em>International Journal of Innovative Discoveries, 12</em>(3), 45-62. https://doi.org/10.1234/ijid.2026.0078',
    mla: 'Chen, Shuang, Wei Liu, and Taeho Park. "Transformer Architecture for Code Generation Tasks." <em>International Journal of Innovative Discoveries</em> 12.3 (2026): 45-62.',
    chicago:
      'Chen, Shuang, Wei Liu, and Taeho Park. "Transformer Architecture for Code Generation Tasks." <em>International Journal of Innovative Discoveries</em> 12, no. 3 (2026): 45-62.',
    bibtex:
      "@article{chen2026transformer,\n  title={Transformer Architecture for Code Generation Tasks},\n  author={Chen, Shuang and Liu, Wei and Park, Taeho},\n  journal={International Journal of Innovative Discoveries},\n  volume={12},\n  number={3},\n  pages={45--62},\n  year={2026}\n}",
  };
  $("#citationFormat").on("change", function () {
    var fmt = $(this).val();
    var text = citations[fmt] || citations.apa;
    if (fmt === "bibtex") {
      $("#citationText").html(
        "<pre style='margin:0;white-space:pre-wrap;font-size:12px;'>" +
          text +
          "</pre>"
      );
    } else {
      $("#citationText").html(text);
    }
  });

  // ========================================
  // Review Decision Selection
  // ========================================
  $(".decision-option input[type='radio']").on("change", function () {
    $(".decision-card").removeClass("selected");
    $(this).siblings(".decision-card").addClass("selected");
  });

  // ========================================
  // Form Submissions (demo alerts)
  // ========================================
  $("#submitPaperForm").on("submit", function (e) {
    e.preventDefault();
    if (!$("#originalWork").is(":checked")) {
      showToast("Please confirm the originality declaration.", "warning", 3200);
      return;
    }
    flashButton($("#submitPaperBtn"), '<i class="ti-check"></i> Submitted');
    showToast(
      "Paper submitted successfully. A confirmation email is on the way.",
      "success",
      3200
    );
  });
  $("#saveDraftBtn").on("click", function () {
    flashButton($(this), '<i class="ti-check"></i> Saved');
    showToast("Draft saved successfully.", "success");
  });
  $("#reviewForm").on("submit", function (e) {
    e.preventDefault();
    if (!$('input[name="decision"]:checked').length) {
      showToast("Please select a recommendation before submitting.", "warning", 3200);
      return;
    }
    flashButton($(this).find('button[type="submit"]').first(), '<i class="ti-check"></i> Submitted');
    showToast("Review submitted successfully. Thank you for your evaluation.", "success", 3200);
  });
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    flashButton($(this).find('button[type="submit"]').first(), '<i class="ti-check"></i> Sent');
    showToast("Message sent. We will get back to you within 1-2 business days.", "success", 3200);
  });

  // ========================================
  // Startup hooks
  // ========================================
  ensureSkipLink();
  applyActiveNavState();
  initScrollTopButton();

  window.IJID = window.IJID || {};
  window.IJID.toast = showToast;

  // ========================================
  // Utility: Format file size
  // ========================================
  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
})(jQuery);
