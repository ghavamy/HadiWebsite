(function($) {
    "use strict";

    //sticky menu
    $(window).on('scroll', function() {
        var window_top = $(window).scrollTop() + 1;
        if (window_top > 50) {
            $('.main_nav').addClass('menu_fixed animated fadeInDown');
        } else {
            $('.main_nav').removeClass('menu_fixed animated fadeInDown');
        }
    });

    //active menu
    $('.troggle_icon').on('click', function() {
        $('.navbar_bar').toggleClass('active_menu');
    });

    // menu hide
    $(document).click(function(event) {
        if (!$(event.target).closest(".header_iner").length) {
            $("body").find(".navbar_bar").removeClass("active_menu");
        }
    })

    //video popup
    var video_popup = $('.popup_youtube');
    if (video_popup.length > 0) {
        video_popup.magnificPopup({
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });
    }

    //counter js
    var time = $('.timer');
    if (time.length > 0) {
        time.countTo();
    }

    //parallax ja
    $(function() {
        var $el = $('.breadcrumb_part');
        $(window).on('scroll', function() {
            var scroll = $(document).scrollTop();
            $el.css({
                'background-position': '50% ' + (+.4 * scroll) + 'px'
            });
        });
    });

    //mega menu js
    //if ($(window).width() < 991) {
    //$('.mega_menu_dropdown ul').hide();
    $('.mega_menu_dropdown a').on('click', function() {
        $(this).parent(".mega_menu_dropdown").children("ul").slideToggle('500');
        $(this).toggleClass('mega_menu_icon');
    });
    //}

    //niceselect select jquery
    var niceSelect = $('.niceSelect');
    if (niceSelect.length > 0) {
        niceSelect.niceSelect();
    }

    //banner slider js
    var bannerSlider = $(".banner_part");
    if (bannerSlider.length) {
        bannerSlider.owlCarousel({
            items: 1,
            loop: true,
            nav: true,
            navText: ["<i class='arrow_left'></i>", "<i class='arrow_right'></i>"],
            dots: false,
            autoplay: true,
            autoplayHoverPause: true,
            smartSpeed: 500,
            animateOut: "slideOutLeft",
            animateIn: "slideInRight",
            responsive: {
                0: {
                    nav: false
                },
                768: {
                    nav: true
                }
            },
        });
    }

    //popular courses js
    var popular_courses = $(".popular_courses_item");
    if (popular_courses.length) {
        popular_courses.owlCarousel({
            items: 3,
            loop: true,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayHoverPause: true,
            smartSpeed: 300,
            dotsSpeed: 300,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                991: {
                    items: 2
                },
                1200: {
                    items: 3
                }
            }

        });
    }

    //review js
    var student_review = $(".student_review_iner");
    if (student_review.length) {
        student_review.owlCarousel({
            items: 1,
            loop: true,
            margin: 10,
            nav: true,
            dots: true,
            autoplay: true,
            autoplayHoverPause: true,
            smartSpeed: 500,
            dots: false,
            navText: ["<i class='arrow_left'></i>", "<i class='arrow_right'></i>"]

        });
    }

    //course category js
    var course_category = $(".course_category_item");
    if (course_category.length) {
        course_category.owlCarousel({
            items: 4,
            loop: true,
            margin: 30,
            nav: false,
            dots: true,
            autoplayHoverPause: true,
            autoplay: true,
            smartSpeed: 300,
            dotsSpeed: 300,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1
                },
                576: {
                    items: 2
                },
                768: {
                    items: 2
                },
                991: {
                    items: 3
                },
                1200: {
                    items: 4
                }
            }
        });
    }

    //blog slider js
    var blog_slider = $(".blog_slider");
    if (blog_slider.length) {
        blog_slider.owlCarousel({
            items: 3,
            loop: true,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayHoverPause: true,
            smartSpeed: 300,
            dotsSpeed: 300,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 1
                },
                991: {
                    items: 2
                },
                1200: {
                    items: 2
                }
            }

        });
    }

    //time countdown
    $(document).ready(function() {
        function coursesTimer() {
            var endTime = new Date("20 August 2026 11:26:00 GMT+03:30");
            endTime = (Date.parse(endTime) / 1000);
            var now = new Date();
            now = (Date.parse(now) / 1000);
            var timeLeft = endTime - now;
            var days = Math.floor(timeLeft / 86400);
            var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
            var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
            if (hours < "10") {
                hours = "0" + hours;
            }
            if (minutes < "10") {
                minutes = "0" + minutes;
            }
            if (seconds < "10") {
                seconds = "0" + seconds;
            }
            $("#days").html(days + "<span>روز</span>");
            $("#hours").html(hours + "<span>ساعت</span>");
            $("#minutes").html(minutes + "<span>دقیقه</span>");
            $("#seconds").html(seconds + "<span>ثانیه</span>");
        }
        setInterval(function() {
            coursesTimer();
        }, 1000);
    });

    //event time countdown
    $(document).ready(function() {
        function eventTimer() {
            var endTime = new Date("1 March 2022 9:56:00 GMT+01:00");
            endTime = (Date.parse(endTime) / 1000);
            var now = new Date();
            now = (Date.parse(now) / 1000);
            var timeLeft = endTime - now;
            var days = Math.floor(timeLeft / 86400);
            var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
            var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
            if (hours < "10") {
                hours = "0" + hours;
            }
            if (minutes < "10") {
                minutes = "0" + minutes;
            }
            if (seconds < "10") {
                seconds = "0" + seconds;
            }

            $("#eventdays").html(days + "<span>Days</span>");
            $("#eventhours").html(hours + "<span>Hours</span>");
            $("#eventminutes").html(minutes + "<span>Minutes</span>");
            $("#eventseconds").html(seconds + "<span>Seconds</span>");
        }
        setInterval(function() {
            eventTimer();
        }, 1000);
    });

    //aos js
    AOS.init({
        once: true,
        disable: function() {
            var maxWidth = 768;
            return window.innerWidth < maxWidth;
        }
    })

    //preloader js
    $(window).on('load', function() {
        $(".preloder_part").fadeOut();
        $(".spinner").delay(1000).fadeOut("slow");
    });

    //map js
    if ($('#contactMap').length) {
        var $lat = $('#contactMap').data('lat');
        var $lon = $('#contactMap').data('lon');
        var $zoom = $('#contactMap').data('zoom');
        var $marker = $('#contactMap').data('marker');
        var $info = $('#contactMap').data('info');
        var $markerLat = $('#contactMap').data('mlat');
        var $markerLon = $('#contactMap').data('mlon');
        var map = new GMaps({
            el: '#contactMap',
            lat: $lat,
            lng: $lon,
            scrollwheel: false,
            scaleControl: true,
            streetViewControl: false,
            panControl: true,
            disableDoubleClickZoom: true,
            mapTypeControl: false,
            zoom: $zoom,
        });
        map.addMarker({
            lat: $markerLat,
            lng: $markerLon,
            icon: $marker,
            infoWindow: {
                content: $info
            }
        })
    }

    //course details js
    $('.lp-entry-content .course-extra-box').on('click', function() {
        $(this).toggleClass('active');
        $('.lp-entry-content .course-extra-box.active .course-extra-box__content').toggleClass('block');
    });

    //lessons js
    $('body').toggleClass('lp-sidebar-toggle__open');

    //popup course js 
    $('#popup-course #sidebar-toggle').on('click', function() {
        $('body').toggleClass('lp-sidebar-toggle__close');
        $('body').toggleClass('lp-sidebar-toggle__open');
    });

    /*====================
    LTR & RTL JS
    ======================*/
    // $('.ltr-rtl-button .default-btn.ltr').on('click', function() {
    //     $("html").attr('dir', 'ltr');
    // });

    // $('.ltr-rtl-button .default-btn.rtl').on('click', function() {
    //     $("html").attr('dir', 'rtl');
    // });

    // Stop Right Click
    // $(document).on({
    //     "contextmenu": function(e) {
    //         console.log("ctx menu button:", e.which);

    //         // Stop the context menu
    //         e.preventDefault();
    //     },
    //     "mousedown": function(e) {
    //         console.log("normal mouse down:", e.which);
    //     },
    //     "mouseup": function(e) {
    //         console.log("normal mouse up:", e.which);
    //     }
    // });

    $('.section-toggle').on('click', function () {

        const section = $(this).closest('.section');

        section.toggleClass('closed');

    });

    // ===== TAB SWITCHING =====
    $(".tab-btn").on("click", function () {

        let index = $(this).index();

        // active tab button
        $(".tab-btn").removeClass("active");
        $(this).addClass("active");

        // show correct form
        $(".auth-form").removeClass("active");
        $(".auth-form").eq(index).addClass("active");
    });

    // ===== EXAM TAB SWITCHING =====
    $(".exam-tab-btn").on("click", function () {
        const type = this.dataset.type;
        // Redirect to same page with type parameter
        window.location.href = `/download/testExams?type=${encodeURIComponent(type)}`;
    });


    // ===== ROLE LOGIC =====
    $("#roleSelect").on("change", function () {

        let value = $(this).val();

        if (value === "student") {
        $("#studentFields").slideDown(200);
        } else {
        $("#studentFields").slideUp(200);
        }

    });

    // for downloading exams page
    $(function() {
        // Tab switching
        $('.tab-btn-modern').on('click', function() {
            var $this = $(this);
            var target = $this.data('tab');
            
            $('.tab-btn-modern').removeClass('active');
            $this.addClass('active');
            
            $('.pdf-tab-panel').removeClass('active');
            $('#panel-' + target).addClass('active');
        });
        
        // Section toggle
        $('.pdf-section-header').on('click', function() {
            var $this = $(this);
            var $body = $this.next('.pdf-section-body');
            
            $this.toggleClass('active');
            $body.toggleClass('open');
        });
        
        // Open first section by default
        var $firstSection = $('.pdf-section-header').first();
        if ($firstSection.length) {
            $firstSection.addClass('active');
            $firstSection.next('.pdf-section-body').addClass('open');
        }
    });

}(jQuery));