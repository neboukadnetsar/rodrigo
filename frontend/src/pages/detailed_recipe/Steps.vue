<template>
    <div class="step-list" v-if="steps">
        <ol>
            <li v-for="step in orderedSteps(steps)">{{ step.descriptionEtape }}</li>
        </ol>
    </div>
</template>

<script>
export default {
    props: {
        steps: Array
    },
    methods:{
        orderedSteps(steps){
            return steps.sort((a,b) => a.ordreEtape - b.ordreEtape);
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