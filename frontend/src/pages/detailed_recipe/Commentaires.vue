<template>
    <v-virtual-scroll :items="items" max-height="300" class="my-4">
        <template v-slot:default="{ item, index }">
            <div :class="[index % 2 === 0 ? 'bg-grey-lighten-2' : 'bg-grey-lighten-1', 'pa-3']">
                <div>{{ item.nom }} | {{ item.date }}</div>
                <v-divider class="border-opacity-25" length="500px" thickness="1.5"></v-divider>
                <div>{{ item.commentaire }}</div>
            </div>
        </template>
    </v-virtual-scroll>
    <v-form @submit.prevent="submitComment" v-if="session.user">
        <v-textarea v-model="comment" clearable label="Nouveau commentaire"></v-textarea>
        <v-btn type="submit" :disabled="!comment">Soumettre</v-btn>
    </v-form>
</template>
  
<script>
import session from '../../session';
import { fetchCommentsById, submitComment } from '../../RecipeService'

export default {
    data() {
        return {
            session: session,
            comments: [],
            comment: ''
        }
    },
    props: {
        recipeId: String
    },
    computed: {
        items() {
            this.comments.sort((a, b) => new Date(a.dateHeure) - new Date(b.dateHeure));
            return this.comments.map(commentaire => {
                return {
                    nom: commentaire.userFullName,
                    date: this.formatDate(commentaire.dateHeure),
                    commentaire: commentaire.commentaire
                }
            });
        }
    },
    methods: {
        formatDate(date) {
            const dateObj = new Date(date);

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}h${minutes}:${seconds}`;
        },
        submitComment() {
            submitComment(this.recipeId, this.comment).then(() => {
                alert("Votre commentaire a été soumis avec succès.");
                this.comment = '';
                this.fetchComments();
            }).catch(err => {
                console.error(err);
            });
        },
        fetchComments() {
            fetchCommentsById(this.recipeId).then(comments => {
                this.comments = comments;
            }).catch(err => {
                console.error(err);
            });
        },
    },
    mounted() {
        this.fetchComments();
    }
}
</script>