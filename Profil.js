/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

const Profil = function(username, name) {
    this.username = username;
    this.name = name;
    this.preferences = [];
    this.token = undefined;
}

module.exports = Profil;
