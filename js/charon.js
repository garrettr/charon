var platforms = {
  'windows': {
    user_agent: /Windows/,
    human_readable: "Windows",
    path: 'windows'
  },
  'mac': {
    user_agent: /Mac OS X/,
    human_readable: "Mac",
    path: 'mac'
  },
  'linux': {
    user_agent: /Linux/,
    human_readable: "Linux",
    path: 'linux'
  }
};

function detect_platform() {
  var detected_platform = null;
  Object.keys(platforms).forEach(function(platform) {
    if (navigator.userAgent.match(platforms[platform].user_agent)) {
      detected_platform = platform;
    }
  });
  return detected_platform; // We didn't find a match for this user agent
}

function guide_path_for_platform(platform) {
  // Restrict URLs to those defined in the platforms object
  if (Object.keys(platforms).indexOf(platform) < 0) {
    return "";
  }
  return platforms[platform]['path'] + "/guide.html"
}

function load_guide_for_platform(platform) {
  if (platform === null) {
    // TODO fill in the iframe with explanatory text
    return;
  }

  var guide_path = guide_path_for_platform(platform);
  // TODO animate transition? might need to use ajax and srcdoc instead
  // Instead of using an iframe and changing the src, could also just use
  // jquery's load method and put it in a div
  $("iframe#guide").attr("src", guide_path);
}

function update_header_for_platform(platform) {
  // TODO? use mustache
  var header_html = "<p>It looks like you're using " 
                  + "<strong>" + platforms[platform].human_readable + "</strong></p>";
  
  // Don't trail off if there's only one platform
  if (Object.keys(platforms).length > 1) {
    header_html += "<p>If not, please choose the guide for ";

    var alt_guides_count = 0;
    Object.keys(platforms).forEach(function(p, i) {
      console.log(p);
      if (p !== platform) {
        header_html += '<a class="alt-guide" href="" '
                    + 'data-platform="'
                    + p
                    + '">'
                    + platforms[p].human_readable
                    + '</a>';
        alt_guides_count += 1;

        if (alt_guides_count !== Object.keys(platforms).length - 1) {
          header_html += " | ";
        }
      }
    });
  }

  header_html += "</p>";
  $("div#header-content").html(header_html);
}

function update_iframe_height() {
  $window = $(window);
  $('iframe#guide').height(function() {
      return $window.height()-$(this).offset().top;   
  });
}

// main
$(function() {
  console.log("document ready"); // DEBUG

  var detected_platform = detect_platform();
  update_header_for_platform(detected_platform);
  load_guide_for_platform(detected_platform);

  // Register handlers for choosing another guide
  $(document).on("click", "a.alt-guide", function(event) {
    var platform = $(this).attr('data-platform');
    console.log("clicked", platform); // DEBUG
    load_guide_for_platform(platform);
    update_header_for_platform(platform);

    // Don't follow the link
    event.preventDefault();
    // Don't bubble
    return false;
  });

  // Register handles for the "close header" button
  // TODO leave the header accessible, maybe with a small toggle or ribbon at
  // the top right of the page
  $(document).on("click", "button#header-close", function(event) {
    $("div#header").fadeOut("slow", function() {
      $(this).remove();
      update_iframe_height();
    });
  });

  // Dynamically resize iframe to fill the rest of the window
  // aka legacy of brutality
  $(window).on('load resize', update_iframe_height);
});
