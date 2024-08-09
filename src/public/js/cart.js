const emptyButton = document.getElementById('empty-cart');
const cartID = document.getElementById('cart-id').textContent;
console.log(cartID)

const empty = async (event) => {
    try {
        const response = await fetch(`/api/carts/${cartID}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        console.log(data);
        location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
};
emptyButton.addEventListener('click', empty);
document.querySelectorAll('.delete-product').forEach(button => {
    button.addEventListener('click', async (event) => {
        const productId = event.target.dataset.productId;
        const cartId = document.getElementById('cart-id').textContent;
        try {
            const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito');
            }
            location.reload();
        } catch (error) {
            console.error(error);
        }
    });
});
document.addEventListener('DOMContentLoaded', (event) => {
    const quantityInputs = document.querySelectorAll('#quantityInput');
    quantityInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            console.log(`La nueva cantidad del producto es: ${event.target.value}`);
            const newQuantity = event.target.value;
            const productId = event.target.dataset.productid;
            console.log('===>>',productId)
            fetch(`/api/carts/${cartID}/product/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newQuantity }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                location.reload(); 
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    });
});