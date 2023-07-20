<template>
    <div>
        <span>
            <v-rating v-model=ratingObj.rating color="blue" hover></v-rating>
            <v-tooltip v-if="ratingObj.rating === null" activator="parent" location="end">Cliquer pour évaluer</v-tooltip>
            <v-tooltip v-else activator="parent" location="end">Votre évaluation actuelle</v-tooltip>
        </span>
    </div>
</template>
  
<script>
import { putRating, fetchRatingByIds } from '../../RecipeService'

export default {
    props: {
        recipeId: String
    },
    watch: {
        'ratingObj.rating'(newRating, oldRating) {
            if (oldRating !== undefined) {
                putRating({
                    userId: this.ratingObj.userId,
                    recetteId: this.ratingObj.recetteId,
                    rating: newRating
                }).then(() => {
                    this.$emit('rating-changed');
                }).catch(err => {
                    console.error(err);
                });
            }
        }
    },
    data() {
        return {
            ratingObj: {}
        }
    },
    mounted() {
        fetchRatingByIds(this.recipeId).then(rating => {
            this.ratingObj = rating;
        }).catch(err => {
            console.error(err);
        });

    }
}
</script>
  