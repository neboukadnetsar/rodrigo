<template>
    <div class="ingrediant-list" v-if="ingrediants">
        <ul>
            <li v-for="ingrediant in orderedIngrediants(ingrediants)">{{ stepBuilder(ingrediant) }}</li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        ingrediants: Array
    },
    methods:{
        orderedIngrediants(ingrediants){
            return ingrediants.sort((a,b) => a.ordreIngredient - b.ordreIngredient);
        },
        stepBuilder(step){
            return (step.quantite ? step.quantite + " " : "") + (step.typeUnite ? step.typeUnite + " " : "") + step.nomIngredient;
        }
    }
}
</script>

<style>
ol, ul {
    list-style-position: inside;
    margin-left: 10px
}
</style>