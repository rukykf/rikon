<script>
  import Layout from "@layouts/main"
  import ShowManagementTransactions from "@views/pages/complementary-reports/components/show-management-transactions"
  import ErrorHandler from "@src/ErrorHandler"
  import FormBackground from "@components/form-background"
  import SaveDebtApprover from "@views/pages/complementary-reports/components/save-debt-approver"
  import SuccessFailureAlert from "@components/success-failure-alert"

  export default {
    name: "debt-approvers",
    components: { SuccessFailureAlert, SaveDebtApprover, FormBackground, ShowManagementTransactions, Layout },
    data() {
      return {
        selectedAuthorizerTransactionsView: false,
        debtAuthorizers: [],
        selectedDebtAuthorizer: null,
        success: [],
        errors: [],
        loading: false,
        tabs: ["Debt Authorizers", "All Authorized Transactions"],
        currentTab: "Debt Authorizers",
      }
    },

    mounted() {
      this.getDebtAuthorizersData()
    },

    methods: {
      async getDebtAuthorizersData() {
        try {
          this.loading = true
          let url = "api/management-list?list_name=authorized_to_authorize"
          let { data: debtAuthorizers } = await this.$httpClient.get(url)
          this.debtAuthorizers = debtAuthorizers
          url += "&active=0"
          let { data: inactiveDebtAuthorizers } = await this.$httpClient.get(url)
          this.debtAuthorizers.push(...inactiveDebtAuthorizers)
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showAddNewDebtAuthorizerModal() {
        this.$bvModal.show("create-debt-authorizer")
      },

      showEditDebtAuthorizerModal(selectedDebtAuthorizer) {
        this.selectedDebtAuthorizer = selectedDebtAuthorizer
        this.$bvModal.show("edit-debt-authorizer")
      },

      async deleteDebtAuthorizer(selectedDebtAuthorizer) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedDebtAuthorizer.id}`
          await this.$httpClient.delete(url)
          this.getDebtAuthorizersData()
          this.success.push(
            `Successfully deleted ${selectedDebtAuthorizer.full_name} from the list of people capable of authorizing debts`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async reactivateDebtAuthorizer(selectedDebtAuthorizer) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedDebtAuthorizer.id}/reactivate`
          await this.$httpClient.post(url)
          this.getDebtAuthorizersData()
          this.success.push(
            `Successfully re-added ${selectedDebtAuthorizer.full_name} to the list of people capable of authorizing debts`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async deactivateDebtAuthorizer(selectedDebtAuthorizer) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedDebtAuthorizer.id}/deactivate`
          await this.$httpClient.post(url)
          this.getDebtAuthorizersData()
          this.success.push(
            `Successfully removed ${selectedDebtAuthorizer.full_name} from the list of people capable of authorizing debts`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      toggleTransactionsView(selectedDebtAuthorizer) {
        this.selectedDebtAuthorizer = selectedDebtAuthorizer
        this.selectedAuthorizerTransactionsView = true
      },
    },
  }
</script>

<template>
  <Layout>
    <div class="mt-5">
      <b-nav tabs justified>
        <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
          <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{
            tab[0].toUpperCase() + tab.slice(1)
          }}</h5>
        </b-nav-item>
      </b-nav>
    </div>
    <SuccessFailureAlert :errors="errors" :success="success" class="mt-2"></SuccessFailureAlert>

    <div v-if="loading" class="text-center">
      <b-spinner class="p-5" variant="dark"></b-spinner>
    </div>

    <div v-else>
      <div class="mt-2" v-if="currentTab === 'Debt Authorizers'">
        <div class="jumbotron bg-soft-active mt-4" v-if="selectedAuthorizerTransactionsView === false">
          <div class="row">
            <button class="btn btn-dark px-5 mb-5" @click.stop.prevent="showAddNewDebtAuthorizerModal"
              >Add New Debt Authorizer</button
            >
          </div>
          <div class="card card-body">
            <div class="row">
              <div class="col-1 text-left">
                <span class="font-weight-bold">S/N:</span>
              </div>
              <div class="col-5 text-left">
                <span class="font-weight-bold">FULL NAME:</span>
              </div>
              <div class="col-5">
                <span class="font-weight-bold">ACTIONS:</span>
              </div>
            </div>
          </div>

          <div class="card card-body" v-for="(authorizer, index) in debtAuthorizers" :key="authorizer.id">
            <div class="row">
              <span class="col-1"> {{ index + 1 }}. </span>
              <div class="col-5 text-left">
                <span v-if="authorizer.active === 1">{{ authorizer.full_name | capitalizeAll }}</span>
                <span v-else-if="authorizer.active === 0" class="text-danger">{{
                  authorizer.full_name | capitalizeAll
                }}</span>
              </div>
              <div class="col-6">
                <button class="btn btn-dark ml-2" @click.stop.prevent="showEditDebtAuthorizerModal(authorizer)"
                  >Edit</button
                >
                <a
                  v-if="authorizer.active === 1"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deactivateDebtAuthorizer(authorizer)"
                  >De-activate</a
                >
                <a
                  v-if="authorizer.active === 0"
                  href="#"
                  class="btn btn-dark ml-2 mt-lg-0 mt-1"
                  @click="reactivateDebtAuthorizer(authorizer)"
                  >Re-activate</a
                >
                <a
                  v-if="authorizer.active === 0"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deleteDebtAuthorizer(authorizer)"
                  >Delete Permanently</a
                >

                <button class="btn btn-dark ml-2 mt-lg-0 mt-1" @click.stop.prevent="toggleTransactionsView(authorizer)"
                  >View Transactions >></button
                >
              </div>
            </div>
          </div>
        </div>

        <div class="jumbotron bg-soft-dark mt-4" v-if="selectedAuthorizerTransactionsView">
          <button class="btn btn-dark px-5 mb-5" @click.stop.prevent="selectedAuthorizerTransactionsView = false"
            ><< Go Back to the List of Debt Authorizers</button
          >
          <ShowManagementTransactions
            v-if="selectedDebtAuthorizer !== null"
            list-name="authorized_to_authorize"
            name-display-title="Transaction Authorized By"
            :transactions-display-title="`Transactions authorized by ${selectedDebtAuthorizer.full_name}`"
            :management-list-item-id="selectedDebtAuthorizer.id"
          ></ShowManagementTransactions>
          <button class="btn btn-dark px-5 mt-2 mb-5" @click.stop.prevent="selectedAuthorizerTransactionsView = false"
            ><< Go Back to the List of Debt Authorizers</button
          >
        </div>
      </div>

      <div class="mt-2" v-if="currentTab === 'All Authorized Transactions'">
        <ShowManagementTransactions
          list-name="authorized_to_authorize"
          name-display-title="Transaction Authorized By"
          :transactions-display-title="`All Authorized Transactions`"
        ></ShowManagementTransactions>
      </div>
    </div>

    <b-modal
      @hide="getDebtAuthorizersData"
      id="edit-debt-authorizer"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Debt Authorizer"
    >
      <FormBackground>
        <SaveDebtApprover :debt-approver="selectedDebtAuthorizer"></SaveDebtApprover>
      </FormBackground>
    </b-modal>
    <b-modal
      @hide="getDebtAuthorizersData"
      id="create-debt-authorizer"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Debt Authorizer"
    >
      <FormBackground>
        <SaveDebtApprover add-multiple></SaveDebtApprover>
      </FormBackground>
    </b-modal>
  </Layout>
</template>

<style scoped></style>
