let userId = document.getElementById('user-id').textContent;
let userRole = document.getElementById('user-role').textContent;

const socketCliente = io();
socketCliente.on("productos", (products) => {
  console.log(products);
  updateProductList(products);
});
const updateProductList = (products) => {
  let productListContainer = document.getElementById("products-list-container");
  let productsList = '<div class="row">';
  products.forEach((product) => {
    productsList += `
      <div class="col-md-4 mb-4"> <!-- Cada producto ocupará 4 columnas en dispositivos medianos y grandes -->
        <div class="card h-100 shadow-sm"> <!-- Añade sombra a la tarjeta -->
          <div class="card-body">
              <img src="${product.thumbnail}" class="card-img-top img-fluid" alt="${product.title}" style="object-fit: contain; height: 100px;margin-bottom: 20px;">
              <h6 class="card-title"><strong>${product.title}</strong></h6>
              <p class="card-text">${product.description}</p>
              <div class="row">
                <h6 class="card-text">Precio: <strong>${product.price} USD</strong></h6>
                <h6 class="card-text">Stock: ${product.stock}</h6>
                <h6 class="card-text">Categoria: ${product.category}</h6>
              </div>
          </div>
          <div class="card-footer">
            <h7 class="card-subtitle mb-2 text-muted">Product ID: ${product._id}</h7>
            <br>
            <h7 class="card-text">Owner: ${product.owner}</h7>
          </div>
        </div>
      </div>`; 
  });

  productsList += '</div>';
  productListContainer.innerHTML = productsList;
}

let form = document.getElementById("formProduct");
form.addEventListener("submit", async (event) => {
  event.preventDefault(); 
  let formData = new FormData(form);
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData, 
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const product = await response.json(); 
    if (response.status == 201) {
      socketCliente.emit('addProduct' , {product , userId , userRole});
      alert('Producto Agregado Correctamente');
      form.reset(); 
    } else {
      alert('Error al agregar el producto.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

let updateForm = document.getElementById("updateForm");
updateForm.addEventListener("submit", (event) => {
  event.preventDefault(); 
  let _id = updateForm.elements.productID.value
  let title = updateForm.elements.title.value;
  let description = updateForm.elements.description.value;
  let stock = updateForm.elements.stock.value;
  let thumbnail = updateForm.elements.thumbnail.value;
  let price = updateForm.elements.price.value;
  let code = updateForm.elements.code.value;
  let category = updateForm.elements.category.value;

  let productData = {};
  if (_id) productData._id = _id;
  if (title) productData.title = title;
  if (description) productData.description = description;
  if (stock) productData.stock = stock;
  if (thumbnail) productData.thumbnail = thumbnail;
  if (price) productData.price = price;
  if (code) productData.code = code;
  if (category) productData.category = category;

  let userData = {
    _id: userId,
    role: userRole
  }
  socketCliente.emit("updateProduct", productData , userData);
});
socketCliente.on('productUpdated', () => {
  alert('Producto Actualizado');
  updateForm.reset(); 
});
const deleteButton =  document.getElementById('delete-btn');
deleteButton.addEventListener('click', async () => {
  let productId = document.getElementById('productID-delete').value;
  let userData = {
    _id: userId,
    role: userRole
  } 
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    if (response.status == 204) {
      socketCliente.emit('deleteProduct' , productId , userData);
      alert('Producto eliminado correctamente!');
      document.getElementById('productID-delete').value = ""; 
    } else {
      alert('Error al eliminar el producto.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
socketCliente.on('error', (errorMessage) => {
    alert(errorMessage);
  });
socketCliente.on("updatedProducts", (obj) => {
  updateProductList(obj); 
});