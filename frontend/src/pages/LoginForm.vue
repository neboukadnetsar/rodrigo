<template>
    <v-container class="login_form">
        <v-form @submit.prevent="login">
            <div>
                <v-text-field 
                    label="Nom d'utilisateur"
                    v-model="username"
                ></v-text-field>
            </div>
            <div>
                <v-text-field 
                    label="Mot de passe" 
                    type="password" 
                    v-model="password"
                ></v-text-field>
            </div>
            <v-btn type="submit" :disabled="isDisabled">Se connecter</v-btn>
        </v-form>
        <span><router-link to="/inscription">Inscription</router-link></span>
    </v-container>
</template>

<script>
import session from '../session';

export default {
    data: function(){
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        login(){
            session.login(this.username, this.password).then(user => {
                alert("Bienvenue, " + user.userFullName + (user.isAdmin ? ".\nVous êtes administrateur." : "."));
                this.$router.push('/');
            }).catch(authError => {
                alert(authError.message);
                this.username = '';
                this.password = '';
            });
        }
    },
    computed:{
        isDisabled(){
            return this.username < 1 || this.password < 1;
        }
    }
}
</script>

<style>

</style>