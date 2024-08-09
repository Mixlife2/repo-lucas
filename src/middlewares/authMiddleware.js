export const applyPolicy = (roles) => {
    return (req, res, next) => {
        if (roles[0].toUpperCase() === "PUBLIC") return next();
        if (!req.user) return res.status(401).send({status:'error', error: 'No autenticado'})
        if (!roles.includes(req.user.role.toUpperCase())) return res.status(403).send({status:'error', error: 'No autorizado'});
        next();
    }
}
export const authorization = (role) => {
    return async(req, res, next)=> {
        if (!req.user) {
            return res.status(401).send({error: 'Unauthorized'});
        }
        if (req.user.role != role) {
            return res.status(403).send({error: 'No permissions'});
        }
        next();
    }
}
export const publicAccess = (req, res, next) => {
    if (req.user) return res.redirect('/products');
    next();
}
export const privateAccess = (req, res, next) => {
    if (!req.user) {
        console.log(req.message)
        return res.redirect('/login');
    }
    next();
}
export const redirectAdmin = (req, res, next) => {
    if (req.user.role == 'admin') {
        return res.redirect('/realtimeproducts');
    
    }
    next();
}
export const checkSession = (req, res, next) => {
	if (!req.user) {
		res.clearCookie('connect.sid');
		return res.redirect('/login');
	}
	next(); 
}
export const sessionExist = (req, res, next) => {
	if (req.user) {
		return res.redirect('/products');
	}
	next();
}