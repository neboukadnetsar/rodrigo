<template>
    <v-container v-if="session.user && session.user.isAdmin">
        <v-form ref="form" v-if="(editMode && recipeExist) || !editMode" class="recipe-form" @submit.prevent="">
            <div>
                <v-text-field 
                    label="Identifiant de la recette" 
                    :disabled="editMode"
                    v-model="recetteId"
                    :rules="[
                        (v) => !!v || 'Identifiant de la recette obligatoire',
                        (v) => /^[a-zA-Z0-9_]+$/.test(v) || 'L\'identifiant doit être composé seulement de lettres, chiffres et underscores'
                        ]"
                    required
                ></v-text-field>
            </div>
            <div>
                <v-text-field 
                    label="Nom de la recette"
                    v-model="nomRecette"
                    :rules="[v => !!v || 'Nom de la recette obligatoire']"
                    required
                ></v-text-field>
            </div>
            <div>
                <v-textarea 
                    label="Description de la recette"
                    v-model="descriptionRecette"
                    :rules="[v => !!v || 'Nom de la recette obligatoire']"
                    required
                ></v-textarea>
            </div>
            <div>
                <v-text-field 
                    label="Temps préparation (minutes)" 
                    type="number" min="0"
                    v-model.number="tempsPreparationMinutes"
                ></v-text-field>
            </div>
            <div>
                <v-text-field 
                    label="Temps cuisson (minutes)"
                    type="number"
                    min="0"
                    v-model.number="tempsCuissonMinutes"
                ></v-text-field>
            </div>
            <div>
                <v-text-field 
                    label="Nombre de portions"
                    type="number"
                    min="0"
                    v-model.number="nbPortions"
                ></v-text-field>
            </div>

            <v-table class="ingrediants-table">
                <thead>
                    <tr>
                        <th class="text-left">Quantité</th>
                        <th class="text-left">Unité (optionel)</th>
                        <th class="text-left">Ingrédient</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ingredient, index in ingredients">
                        <td><v-text-field type="number" min="0" step="any" v-model.number="ingredient.quantite"></v-text-field></td>
                        <td><v-select :items="allowedUnits" v-model="ingredient.typeUnite"></v-select></td>
                        <td class="w-50">
                            <v-text-field 
                                v-model="ingredient.nomIngredient"
                                :rules="[v => !!v || 'Champ ingrédient est obligatoire']"
                                required
                            ></v-text-field></td>
                        <td><v-btn :disabled="index == ingredients.length - 1" icon="mdi-arrow-down" @click="moveDown(index, ingredients)"></v-btn></td>
                        <td><v-btn :disabled="index == 0" icon="mdi-arrow-up" @click="moveUp(index, ingredients)"></v-btn></td>
                        <td><v-btn icon="mdi-delete" @click="deleteRow(index, ingredients)"></v-btn></td>
                    </tr>
                </tbody>
                <tfoot >
                    <tr>
                        <td colspan="6" >
                            <v-btn @click="addIngrediant">Ajouter</v-btn>
                        </td>
                    </tr>
                </tfoot>
            </v-table>
            <v-divider></v-divider>
            <v-table class="directions-table">
                <thead>
                    <tr>
                        <th class="text-left">Étape</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="etape, index in etapes">
                        <td class="w-75">
                            <v-text-field 
                                v-model="etape.descriptionEtape"
                                :rules="[v => !!v || 'Champ étape est obligatoire']"
                                required
                            ></v-text-field></td>
                        <td><v-btn :disabled="index == etapes.length - 1" icon="mdi-arrow-down" @click="moveDown(index, etapes)"></v-btn></td>
                        <td><v-btn :disabled="index == 0" icon="mdi-arrow-up" @click="moveUp(index, etapes)"></v-btn></td>
                        <td><v-btn icon="mdi-delete" @click="deleteRow(index, etapes)"></v-btn></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="6">
                            <v-btn @click="addStep">Ajouter</v-btn>
                        </td>
                    </tr>
                </tfoot>
            </v-table>
            <v-btn @click="validate">Enregistrer</v-btn>
        </v-form>
        <div v-else>Cette recette n'existe pas</div>
    </v-container>
    <div v-else>Cette page est reservée aux administrateurs</div>
</template>

<script>
import session from '../../session';
import { fetchRecipe, fetchIngrediantUnits, postRecipe, putRecipe } from '../../RecipeService'

export default {
    props: {
        id: String
    },
    data: function () {
        return {
            recipeExist: false,
            editMode: false,
            session: session,
            recetteId: '',
            nomRecette: '',
            descriptionRecette: '',
            tempsPreparationMinutes: null,
            tempsCuissonMinutes: null,
            nbPortions: null,
            ingredients: [
                {
                    quantite: null,
                    typeUnite: null,
                    nomIngredient: ''
                }
            ],
            etapes: [
                {
                    descriptionEtape: ''
                }
            ],
            allowedUnits: [''],
            recetteIdRule: [
                value => {
                    if(value) return true

                    return 'Recette Id est obligatoire'
                }
            ]
        };
    },
    methods:{
        deleteRow(index, arr){
            arr.splice(index, 1);
        },
        addIngrediant(){
            this.ingredients.push({
                quantite: null,
                typeUnite: null,
                nomIngredient: ''
            });
        },
        addStep(){
            this.etapes.push({
                descriptionEtape: ''
            });
        },
        moveUp(index, arr){
            if(index != 0)
                this.permute(index, index-1, arr);
        },
        moveDown(index, arr){
            if(index != arr.length - 1)
                this.permute(index, index+1, arr);
        },
        permute(index1, index2, arr){
            let temp = arr[index1];
            arr[index1] = arr[index2];
            arr[index2] = temp;
        },
        save(){
            const recipe = this.buildRecipe();
            if(this.editMode){
                putRecipe(recipe).then(() => {
                    this.$router.push(`/recettes/${recipe.recetteId}`);
                }).catch(err => {
                    console.error(err);
                });
            }else{
                postRecipe(recipe).then(() => {
                    this.$router.push(`/recettes/${recipe.recetteId}`);
                }).catch(err => {
                    console.error(err);
                });
            }
        },
        buildRecipe(){
            return {
                recetteId: this.recetteId,
                nomRecette: this.nomRecette,
                descriptionRecette: this.descriptionRecette,
                tempsPreparationMinutes: this.tempsPreparationMinutes,
                tempsCuissonMinutes: this.tempsCuissonMinutes,
                nbPortions: this.nbPortions,
                etapes: this.buildDirectionsList(),
                ingredients: this.buildIngrediantdList()
            };
        },
        buildDirectionsList(){
            return this.etapes.map((etape, index) => {
                return {
                    descriptionEtape: etape.descriptionEtape,
                    ordreEtape: index + 1
                };
            });
        },
        buildIngrediantdList(){
            return this.ingredients.map((ingredient, index) => {
                return {
                    nomIngredient: ingredient.nomIngredient,
                    ordreIngredient: index+1,
                    quantite: ingredient.quantite,
                    typeUnite: ingredient.typeUnite
                };
            });
        },
        async validate() {
            const { valid } = await this.$refs.form.validate()

            if (valid) this.save()
        },
    },
    watch:{
        // Watching changes on $route clear fields and disable EditMode if clicking nouvelle recette from /edit/:id
        $route(){
            this.recetteId = '';
            this.nomRecette = '';
            this.descriptionRecette = '';
            this.tempsPreparationMinutes = null;
            this.tempsCuissonMinutes = null;
            this.nbPortions = null;
            this.ingredients = [{
                    quantite: null,
                    typeUnite: null,
                    nomIngredient: ''
            }];
            this.etapes = [{
                    descriptionEtape: ''
            }];
            this.editMode = false;
        }
    },
    mounted(){
        if(this.id){
            this.editMode = true;
            fetchRecipe(this.id).then(recipe => {
                this.recetteId = recipe.recetteId;
                this.nomRecette = recipe.nomRecette;
                this.descriptionRecette = recipe.descriptionRecette;
                this.tempsPreparationMinutes = recipe.tempsPreparationMinutes;
                this.tempsCuissonMinutes = recipe.tempsCuissonMinutes;
                this.nbPortions = recipe.nbPortions;
                this.ingredients = recipe.ingredients;
                this.etapes = recipe.etapes;
                this.recipeExist = true;
            }).catch(err => {
                console.log(err);
            });
        }
        fetchIngrediantUnits().then(units => {
            this.allowedUnits = units.map(unit => {
                return unit.typeUnite;
            });
            this.allowedUnits.unshift('');
        }).catch(err => {
            console.log(err);
        });
    }
}
</script>

