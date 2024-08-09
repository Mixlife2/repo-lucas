export default class userDTO {
    constructor(user){
        this._id = user._id ? user._id : user.id
        this.firstName = user.first_name,
        this.lastName = user.last_name,
        this.age = user.age,
        this.email = user.email
    }
}