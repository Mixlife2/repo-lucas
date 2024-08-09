const addToCartButtons = document.querySelectorAll('.card button#addToCart');
addToCartButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      const card = button.closest('.card');
      const productID = card.querySelector('.card-id').textContent.replace('PID: ', '').trim();
      const cartID = document.getElementById('cart-id').textContent.trim();
      const response = await fetch(`/api/products/${productID}`);
      const productData = await response.json();

      if (productData.payload.stock > 0) {
        const response = await fetch(`/api/carts/${cartID}/product/${productID}`, {
          method: 'POST',
        });
        const data = await response.json();
        console.log(data);
        Toastify({
          text: "Producto agregado al carrito",
          duration: 1000,
          close: true,
          gravity: "top", 
          position: 'right', 
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();

      } else {  
        Toastify({
          text: "El producto no está en stock",
          duration: 1000,
          close: true,
          gravity: "top", 
          position: 'right', 
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

document.getElementById('resetButton').addEventListener('click', function() {
  document.getElementById('productForm').reset();
  location.reload();
});