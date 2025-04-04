document.addEventListener("DOMContentLoaded", function () {
  const images = document.querySelectorAll('.image-container img');
  let currentIndex = 0;

  function showImages() {
      const totalImages = images.length;
      currentIndex = (currentIndex + 1) % totalImages;

      const offset = -currentIndex * 200; // Largura da imagem
      document.querySelector('.image-container').style.transform = `translateX(${offset}px)`;
  }

  setInterval(showImages, 3000); // Troca a cada 3 segundos
  showImages(); // Chama a função ao carregar
});

document.addEventListener("DOMContentLoaded", () => {
  let currentPath = window.location.pathname;
  if (currentPath.startsWith('/')) {
      currentPath = currentPath.substring(1);
  }
  const navLinks = document.querySelectorAll('.navigation-home a');
  navLinks.forEach(link => {
      if (currentPath.endsWith(link.getAttribute('href'))) {
          link.classList.add('active');
          link.style.backgroundColor = 'white';
          link.style.color = 'black';
      }
  });
});

document.getElementById("currentyear").textContent = new Date().getFullYear();
document.getElementById("lastModified").textContent = "Last Modification: " + document.lastModified;
