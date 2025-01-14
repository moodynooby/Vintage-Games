function createNavbar() {
    const currentPage = window.location.pathname.split('/').pop(); // Get current filename
    const pages = [
        { name: 'Home', url: 'Index.html' },
        { name: '2048', url: '2048.html' },
        { name: 'Object Namer', url: 'Object.html' },
        // Add other pages here
    ];

    let navbarHtml = '<nav class="navbar navbar-expand-lg bg-body-tertiary "> <div class="container-fluid" >  <ul class="navbar-nav "> <img assets="https://www.svgrepo.com/download/475521/arcade.svg" class="icon" >';

    pages.forEach(page => {
        const isActive = (page.url === currentPage) ? 'active' : '';
        navbarHtml += `<li class="nav-item"><a class="nav-link ${isActive}" href="${page.url}">${page.name}</a></li>`;
    });

    navbarHtml += ' <form class="d-flex" role="search"> <input class="form-control me-2" type="search" placeholder="Search"  aria-label="Search">  <button class="btn btn-outline-success"  type="submit">Search </button>  </form></ul> </div> </nav>'; // Close the navbar tags

    document.getElementById('navbar-container').innerHTML = navbarHtml;
}

window.onload = createNavbar; // Call the function when the page loads