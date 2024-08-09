const form = document.getElementById('registerForm');

form.addEventListener('submit', e => {
    e.preventDefault()
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value); 
    fetch('api/sessions/register', {         
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type':'application/json'
        }
    }).then(result => {
        if (!result.ok) {
            throw new Error('Error en el registro');
        }
        return result.json();
    }).then(json => {
        console.log(json); 
        Swal.fire({
            icon: 'success',
            title: '¡Registrado exitosamente!',
            text: 'Te has registrado exitosamente!'
        });
        form.reset();
    }).catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Hubo un error en el registro!'
        });
        console.error('Error:', error);
    });
})