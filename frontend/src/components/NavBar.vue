<template>
    <header>
        <v-app-bar class="bg-black">
            <v-app-bar-title>
                <div>
                    <h1 class="text-h4 text-white">Les recettes de <span class="font-weight-bold">RODRIGO</span></h1>
                </div>
            </v-app-bar-title>
            <template v-slot:append>
                <v-btn to="/">
                    Recettes
                </v-btn>
                <v-btn v-if="session.user && session.user.isAdmin" to="/add">
                    Nouvelle recette
                </v-btn>
                <v-spacer vertical class="ma-2"></v-spacer>
                <div>
                    <div>
                        <v-btn v-if="session.user" @click.prevent="session.disconnect()"
                            :prepend-icon="session.user && session.user.isAdmin ? 'mdi-account-wrench-outline' : 'mdi-logout'">
                            Déconnexion
                        </v-btn>
                        <span v-else>
                            <v-btn to="/connexion" prepend-icon="mdi-login">
                                Se connecter
                            </v-btn>
                            <v-btn to="/inscription" prepend-icon="mdi-account">
                                Inscription
                            </v-btn>
                        </span>

                    </div>
                    <div class="text-body-2 text-center" v-if="session.user">
                        Bienvenue, {{ session.user.userFullName }}
                    </div>

                </div>
                <v-spacer vertical class="ma-4"></v-spacer>
                <span v-if="session.user && session.user.isAdmin" style="color: red">
                    ADMINISTRATEUR
                </span>
            </template>
        </v-app-bar>
    </header>
</template>

<script>
import session from '../session';

export default {
    data: function () {
        return {
            session: session
        };
    },
}
</script>

<style scoped>
.nav-bar {
    display: flex;
    justify-content: space-between;
    padding: 0rem;
}

.connexion {
    padding: 0.3rem;
    text-align: right;
}

#app>header>div>div.connexion>div>span:nth-child(1)>a {
    margin-right: 5%;
}
</style>