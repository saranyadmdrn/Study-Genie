$(document).ready(function() {
    $.support.css3d = supportsCSS3D();

    var formContainer = $('.forms-container');

    $('.flip').click(function(e) {

        formContainer.toggleClass('flipped');

        if (!$.support.css3d)
            $('#signin-form').toggle();

        e.preventDefault();
    });


    function supportsCSS3D() {
        var props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective'];

        testDom = document.createElement('a');
        for (var i = 0; i < props.length; i++)
            if (props[i] in testDom.style)
                return true;

        return false;
    }
});

$(document).ready(function() {

    $('.scroll').click(function(e) {
        e.preventDefault();

        var hash = this.hash;

        $('html, body').animate({ scrollTop: $(hash).offset().top }, 700);
    });
});
