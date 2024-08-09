const form = document.getElementById('resetpassword-form');

const handleResponse = (result) => {
    console.log(result);
    const message = result.status === 'success' 
        ? 'Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.' 
        : `Error: ${result.message}`;
    alert(message);
};
const handleError = (error) => {
    console.error('Error:', error);
    alert('Ha ocurrido un error. Por favor, inténtalo de nuevo.');
};

const validateFormData = (data) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(data.get('email'))) {
        alert('Por favor, introduce un correo electrónico válido.');
        return false;
    }
    return true;
};

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = Object.fromEntries(data);
    if (!validateFormData(data)) {
        return;
    }
    fetch('api/sessions/resetpassword', {            
        method: 'POST', 
        body: JSON.stringify(obj), 
        headers: {
            'Content-Type':'application/json' 
        }
    })
    .then(response => response.json()) 
    .then(handleResponse) 
    .catch(handleError); 
});