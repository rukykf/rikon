<script>
  import Layout from "@layouts/main"
  import ShowManagementTransactions from "@views/pages/complementary-reports/components/show-management-transactions"
  import ErrorHandler from "@src/ErrorHandler"
  import FormBackground from "@components/form-background"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import SaveComplementaryReceiver from "@views/pages/complementary-reports/components/save-complementary-receiver"

  export default {
    name: "approved-for-complementary",
    components: {
      SaveComplementaryReceiver,
      SuccessFailureAlert,
      FormBackground,
      ShowManagementTransactions,
      Layout,
    },
    data() {
      return {
        selectedComplementaryRecipientTransactionsView: false,
        complementaryRecipients: [],
        selectedComplementaryRecipient: null,
        success: [],
        errors: [],
        loading: false,
        tabs: ["Authorized Complementary Recipients", "All Complementary Transactions"],
        currentTab: "Authorized Complementary Recipients",
      }
    },

    mounted() {
      this.getComplementaryRecipientsData()
    },

    methods: {
      async getComplementaryRecipientsData() {
        try {
          this.loading = true
          let url = "api/management-list?list_name=authorized_for_complementary"
          let { data: complementaryRecipients } = await this.$httpClient.get(url)
          this.complementaryRecipients = complementaryRecipients
          url += "&active=0"
          let { data: inactiveComplementaryRecipients } = await this.$httpClient.get(url)
          this.complementaryRecipients.push(...inactiveComplementaryRecipients)
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showAddNewComplementaryRecipientModal() {
        this.$bvModal.show("create-complementary-recipient")
      },

      showEditComplementaryRecipientModal(selectedComplementaryRecipient) {
        this.selectedComplementaryRecipient = selectedComplementaryRecipient
        this.$bvModal.show("edit-complementary-recipient")
      },

      async deleteComplementaryRecipient(selectedComplementaryRecipient) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedComplementaryRecipient.id}`
          await this.$httpClient.delete(url)
          this.getComplementaryRecipientsData()
          this.success.push(
            `Successfully deleted ${selectedComplementaryRecipient.full_name} from the list of people authorized to receive complementary service`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async reactivateComplementaryRecipient(selectedComplementaryRecipient) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedComplementaryRecipient.id}/reactivate`
          await this.$httpClient.post(url)
          this.getComplementaryRecipientsData()
          this.success.push(
            `Successfully re-added ${selectedComplementaryRecipient.full_name} to the list of people authorized for complementary service`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async deactivateComplementaryRecipient(selectedComplementaryRecipient) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedComplementaryRecipient.id}/deactivate`
          await this.$httpClient.post(url)
          this.getComplementaryRecipientsData()
          this.success.push(
            `Successfully removed ${selectedComplementaryRecipient.full_name} from the list of people authorized for complementary service`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      toggleTransactionsView(selectedComplementaryRecipient) {
        this.selectedComplementaryRecipient = selectedComplementaryRecipient
        this.selectedComplementaryRecipientTransactionsView = true
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

    <div class="mt-2" v-if="currentTab === 'Authorized Complementary Recipients'">
      <div v-if="loading" class="text-center">
        <b-spinner class="p-5" variant="dark"></b-spinner>
      </div>
      <div v-else>
        <div class="jumbotron bg-soft-active mt-4" v-if="selectedComplementaryRecipientTransactionsView === false">
          <div class="row">
            <button class="btn btn-dark px-5 mb-5" @click.stop.prevent="showAddNewComplementaryRecipientModal"
              >Add New Complementary Recipient</button
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

          <div
            class="card card-body"
            v-for="(complementaryRecipient, index) in complementaryRecipients"
            :key="complementaryRecipient.id"
          >
            <div class="row">
              <span class="col-1"> {{ index + 1 }}. </span>
              <div class="col-5 text-left">
                <span v-if="complementaryRecipient.active === 1">{{
                  complementaryRecipient.full_name | capitalizeAll
                }}</span>
                <span v-else-if="complementaryRecipient.active === 0" class="text-danger">{{
                  complementaryRecipient.full_name | capitalizeAll
                }}</span>
              </div>
              <div class="col-6">
                <button
                  class="btn btn-dark ml-2"
                  @click.stop.prevent="showEditComplementaryRecipientModal(complementaryRecipient)"
                  >Edit</button
                >
                <a
                  v-if="complementaryRecipient.active === 1"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deactivateComplementaryRecipient(complementaryRecipient)"
                  >De-activate</a
                >
                <a
                  v-else-if="complementaryRecipient.active === 0"
                  href="#"
                  class="btn btn-dark ml-2 mt-lg-0 mt-1"
                  @click="reactivateComplementaryRecipient(complementaryRecipient)"
                  >Re-activate</a
                >
                <a
                  v-if="complementaryRecipient.active === 0"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deleteComplementaryRecipient(complementaryRecipient)"
                  >Delete Permanently</a
                >
                <button
                  class="btn btn-dark ml-2 mt-lg-0 mt-1"
                  @click.stop.prevent="toggleTransactionsView(complementaryRecipient)"
                  >View Transactions >></button
                >
              </div>
            </div>
          </div>
        </div>

        <div class="jumbotron bg-soft-dark mt-4" v-if="selectedComplementaryRecipientTransactionsView">
          <button
            class="btn btn-dark px-5 mb-5"
            @click.stop.prevent="selectedComplementaryRecipientTransactionsView = false"
            ><< Go Back to the List of Complementary Recipients</button
          >
          <ShowManagementTransactions
            v-if="selectedComplementaryRecipient !== null"
            list-name="authorized_for_complementary"
            name-display-title="Complementary Service For"
            :transactions-display-title="
              `Complementary Transactions For ${selectedComplementaryRecipient.full_name.toUpperCase()}`
            "
            :management-list-item-id="selectedComplementaryRecipient.id"
          ></ShowManagementTransactions>
          <button
            class="btn btn-dark px-5 mt-2 mb-5"
            @click.stop.prevent="selectedComplementaryRecipientTransactionsView = false"
            ><< Go Back to the List of Complementary Recipients</button
          >
        </div>
      </div>
    </div>

    <div class="mt-2" v-if="currentTab === 'All Complementary Transactions'">
      <ShowManagementTransactions
        list-name="authorized_for_complementary"
        name-display-title="Complementary Service For"
        :transactions-display-title="`All Complementary Transactions`"
      ></ShowManagementTransactions>
    </div>
    <b-modal
      @hide="getComplementaryRecipientsData"
      id="edit-complementary-recipient"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Complementary Recipient"
    >
      <FormBackground>
        <SaveComplementaryReceiver :complementary-receiver="selectedComplementaryRecipient"></SaveComplementaryReceiver>
      </FormBackground>
    </b-modal>
    <b-modal
      @hide="getComplementaryRecipientsData"
      id="create-complementary-recipient"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Complementary Recipient"
    >
      <FormBackground>
        <SaveComplementaryReceiver add-multiple></SaveComplementaryReceiver>
      </FormBackground>
    </b-modal>
  </Layout>
</template>

<style scoped></style>
