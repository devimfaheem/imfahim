(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Typed Initiate
    if ($('.typed-text-output').length == 1) {
        var typed_strings = $('.typed-text').text();
        var typed = new Typed('.typed-text-output', {
            strings: typed_strings.split(', '),
            typeSpeed: 100,
            backSpeed: 20,
            smartBackspace: false,
            loop: true
        });
    }


    // Smooth scrolling to section
    $(".btn-scroll").on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            
            $('html, body').animate({
                scrollTop: $(this.hash).offset().top - 0
            }, 1500, 'easeInOutExpo');
        }
    });
    
    
    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: true,
        loop: true,
        items: 1
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
})(jQuery);

function sendEmail(event) {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const apiUrl = 'https://api.brevo.com/v3/emailCampaigns';
    const apiKey = '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';

    const campaignData = {
        name: name,
        subject: subject,
        sender: { name: name, email: email },
        type: 'classic',
        htmlContent: message,
        recipients: { listIds: [1] },
        scheduledAt: new Date(new Date().getTime() + 30000).toISOString()
    };
    //console.log(campaignData);
    fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(campaignData)
      }).then(response => response.json())
        .then(data => {
            console.log('Campaign created successfully:', data);
        })
        .catch(error => {
            console.error('Error creating campaign:', error);
        });
        event.preventDefault();
}

function sendEmailSendGrid(event) {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const sendgridApiUrl = 'https://api.sendgrid.com/v3/mail/send';
    const sendgridApiKey = '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';

    const emailData = {
    personalizations: [
        {
            to: [{ email: 'dev.imfaheem@gmail.com' }],
        },
    ],
    from: { email: email, name: name },
    subject: subject,
    content: [
            {
                type: 'text/plain',
                value: message,
            },
        ],
    };

    fetch(sendgridApiUrl, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Email sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending email:', error);
    });
    event.preventDefault();
  }

