<script>
  import Layout from "@layouts/main"
  import ShowManagementTransactions from "@views/pages/complementary-reports/components/show-management-transactions"
  import ErrorHandler from "@src/ErrorHandler"
  import FormBackground from "@components/form-background"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import SaveCompany from "@views/pages/complementary-reports/components/save-company"

  export default {
    name: "company-transactions",
    components: {
      SaveCompany,
      SuccessFailureAlert,
      FormBackground,
      ShowManagementTransactions,
      Layout,
    },
    data() {
      return {
        selectedCompanyTransactionsView: false,
        authorizedCompanies: [],
        selectedCompany: null,
        success: [],
        errors: [],
        loading: false,
        tabs: ["Companies", "All Company Transactions"],
        currentTab: "Companies",
      }
    },

    mounted() {
      this.getCompaniesData()
    },

    methods: {
      async getCompaniesData() {
        try {
          this.loading = true
          let url = "api/management-list?list_name=authorized_company"
          let { data: companies } = await this.$httpClient.get(url)
          this.authorizedCompanies = companies
          url += "&active=0"
          let { data: inactiveCompanies } = await this.$httpClient.get(url)
          this.authorizedCompanies.push(...inactiveCompanies)
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showAddNewCompanyRecipientModal() {
        this.$bvModal.show("create-company")
      },

      showEditCompanyRecipientModal(selectedCompany) {
        this.selectedCompany = selectedCompany
        this.$bvModal.show("edit-company")
      },

      async deleteCompany(selectedCompany) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedCompany.id}`
          await this.$httpClient.delete(url)
          this.getCompaniesData()
          this.success.push(`Successfully deleted ${selectedCompany.full_name} from the list of authorized companies`)
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async reactivateCompany(selectedCompany) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedCompany.id}/reactivate`
          await this.$httpClient.post(url)
          this.getCompaniesData()
          this.success.push(`Successfully re-added ${selectedCompany.full_name} to the list of companies`)
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async deactivateCompany(selectedCompany) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedCompany.id}/deactivate`
          await this.$httpClient.post(url)
          this.getCompaniesData()
          this.success.push(`Successfully removed ${selectedCompany.full_name} from the list of companies`)
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      toggleTransactionsView(selectedCompany) {
        this.selectedCompany = selectedCompany
        this.selectedCompanyTransactionsView = true
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

    <div class="mt-2" v-if="currentTab === 'Companies'">
      <div v-if="loading" class="text-center">
        <b-spinner class="p-5" variant="dark"></b-spinner>
      </div>
      <div v-else>
        <div class="jumbotron bg-soft-active mt-4" v-if="selectedCompanyTransactionsView === false">
          <div class="row">
            <button class="btn btn-dark px-5 mb-5" @click.stop.prevent="showAddNewCompanyRecipientModal"
              >Add New Company</button
            >
          </div>
          <div class="card card-body">
            <div class="row">
              <div class="col-1 text-left">
                <span class="font-weight-bold">S/N:</span>
              </div>
              <div class="col-5 text-left">
                <span class="font-weight-bold">COMPANY NAME:</span>
              </div>
              <div class="col-5">
                <span class="font-weight-bold">ACTIONS:</span>
              </div>
            </div>
          </div>

          <div class="card card-body" v-for="(company, index) in authorizedCompanies" :key="company.id">
            <div class="row">
              <span class="col-1"> {{ index + 1 }}. </span>
              <div class="col-5 text-left">
                <span v-if="company.active === 1">{{ company.full_name | capitalizeAll }}</span>
                <span v-else-if="company.active === 0" class="text-danger">{{
                  company.full_name | capitalizeAll
                }}</span>
              </div>
              <div class="col-6">
                <button class="btn btn-dark ml-2" @click.stop.prevent="showEditCompanyRecipientModal(company)"
                  >Edit</button
                >
                <a
                  v-if="company.active === 1"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deactivateCompany(company)"
                  >De-activate</a
                >
                <a
                  v-else-if="company.active === 0"
                  href="#"
                  class="btn btn-dark ml-2 mt-lg-0 mt-1"
                  @click="reactivateCompany(company)"
                  >Re-activate</a
                >
                <a
                  v-if="company.active === 0"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deleteCompany(company)"
                  >Delete Permanently</a
                >
                <button class="btn btn-dark ml-2 mt-lg-0 mt-1" @click.stop.prevent="toggleTransactionsView(company)"
                  >View Transactions >></button
                >
              </div>
            </div>
          </div>
        </div>

        <div class="jumbotron bg-soft-dark mt-4" v-if="selectedCompanyTransactionsView">
          <button class="btn btn-dark px-5 mb-5" @click.stop.prevent="selectedCompanyTransactionsView = false"
            ><< Go Back to the List of Companies</button
          >
          <ShowManagementTransactions
            v-if="selectedCompany !== null"
            list-name="authorized_company"
            name-display-title="Company Name"
            :transactions-display-title="`Transactions For ${selectedCompany.full_name.toUpperCase()}`"
            :management-list-item-id="selectedCompany.id"
          ></ShowManagementTransactions>
          <button class="btn btn-dark px-5 mt-2 mb-5" @click.stop.prevent="selectedCompanyTransactionsView = false"
            ><< Go Back to the List of Companies</button
          >
        </div>
      </div>
    </div>

    <div class="mt-2" v-if="currentTab === 'All Company Transactions'">
      <ShowManagementTransactions
        list-name="authorized_company"
        name-display-title="Company Name"
        :transactions-display-title="`All Company Transactions`"
      ></ShowManagementTransactions>
    </div>
    <b-modal
      @hide="getCompaniesData"
      id="edit-company"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Company"
    >
      <FormBackground>
        <SaveCompany :company="selectedCompany"></SaveCompany>
      </FormBackground>
    </b-modal>
    <b-modal
      @hide="getCompaniesData"
      id="create-company"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Company"
    >
      <FormBackground>
        <SaveCompany add-multiple></SaveCompany>
      </FormBackground>
    </b-modal>
  </Layout>
</template>

<style scoped></style>
