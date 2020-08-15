<script>
  import Layout from "@layouts/main"
  import ShowManagementTransactions from "@views/pages/complementary-reports/components/show-management-transactions"
  import ErrorHandler from "@src/ErrorHandler"
  import FormBackground from "@components/form-background"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import SaveDiscountReceiver from "@views/pages/complementary-reports/components/save-discount-receiver"

  export default {
    name: "approved-for-discounts",
    components: {
      SaveDiscountReceiver,
      SuccessFailureAlert,
      FormBackground,
      ShowManagementTransactions,
      Layout,
    },
    data() {
      return {
        selectedDiscountRecipientsTransactionsView: false,
        discountRecipients: [],
        selectedDiscountRecipient: null,
        success: [],
        errors: [],
        loading: false,
        tabs: ["Authorized Discount Recipients", "All Discount Transactions"],
        currentTab: "Authorized Discount Recipients",
      }
    },

    mounted() {
      this.getDiscountRecipientsData()
    },

    methods: {
      async getDiscountRecipientsData() {
        try {
          this.loading = true
          let url = "api/management-list?list_name=authorized_for_discounts"
          let { data: discountRecipients } = await this.$httpClient.get(url)
          this.discountRecipients = discountRecipients
          url += "&active=0"
          let { data: inactiveDiscountRecipients } = await this.$httpClient.get(url)
          this.discountRecipients.push(...inactiveDiscountRecipients)
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showAddNewDiscountRecipientModal() {
        this.$bvModal.show("create-discount-recipient")
      },

      showEditDiscountRecipientModal(selectedDiscontRecipient) {
        this.selectedDiscountRecipient = selectedDiscontRecipient
        this.$bvModal.show("edit-discount-recipient")
      },

      async deleteDiscountRecipient(selectedDiscountRecipient) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedDiscountRecipient.id}`
          await this.$httpClient.delete(url)
          this.getDiscountRecipientsData()
          this.success.push(
            `Successfully deleted ${selectedDiscountRecipient.full_name} from the list of people authorized to receive discounts`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async reactivateDiscountRecipient(selectedDiscountRecipient) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedDiscountRecipient.id}/reactivate`
          await this.$httpClient.post(url)
          this.getDiscountRecipientsData()
          this.success.push(
            `Successfully re-added ${selectedDiscountRecipient.full_name} to the list of people authorized for discounts`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async deactivateDiscountRecipient(selectedDiscountRecipient) {
        try {
          event.target.text = "Loading..."
          let url = `api/management-list/${selectedDiscountRecipient.id}/deactivate`
          await this.$httpClient.post(url)
          this.getDiscountRecipientsData()
          this.success.push(
            `Successfully removed ${selectedDiscountRecipient.full_name} from the list of people authorized for discounts`
          )
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      toggleTransactionsView(selectedDiscountRecipient) {
        this.selectedDiscountRecipient = selectedDiscountRecipient
        this.selectedDiscountRecipientsTransactionsView = true
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

    <div class="mt-2" v-if="currentTab === 'Authorized Discount Recipients'">
      <div v-if="loading" class="text-center">
        <b-spinner class="p-5" variant="dark"></b-spinner>
      </div>
      <div v-else>
        <div class="jumbotron bg-soft-active mt-4" v-if="selectedDiscountRecipientsTransactionsView === false">
          <div class="row">
            <button class="btn btn-dark px-5 mb-5" @click.stop.prevent="showAddNewDiscountRecipientModal"
              >Add New Discount Recipient</button
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
            v-for="(discountRecipient, index) in discountRecipients"
            :key="discountRecipient.id"
          >
            <div class="row">
              <span class="col-1"> {{ index + 1 }}. </span>
              <div class="col-5 text-left">
                <span v-if="discountRecipient.active === 1">{{ discountRecipient.full_name | capitalizeAll }}</span>
                <span v-else-if="discountRecipient.active === 0" class="text-danger">{{
                  discountRecipient.full_name | capitalizeAll
                }}</span>
              </div>
              <div class="col-6">
                <button
                  class="btn btn-dark ml-2"
                  @click.stop.prevent="showEditDiscountRecipientModal(discountRecipient)"
                  >Edit</button
                >
                <a
                  v-if="discountRecipient.active === 1"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deactivateDiscountRecipient(discountRecipient)"
                  >De-activate</a
                >
                <a
                  v-else-if="discountRecipient.active === 0"
                  href="#"
                  class="btn btn-dark ml-2 mt-lg-0 mt-1"
                  @click="reactivateDiscountRecipient(discountRecipient)"
                  >Re-activate</a
                >
                <a
                  v-if="discountRecipient.active === 0"
                  href="#"
                  class="btn btn-danger ml-2 mt-lg-0 mt-1"
                  @click="deleteDiscountRecipient(discountRecipient)"
                  >Delete Permanently</a
                >
                <button
                  class="btn btn-dark ml-2 mt-lg-0 mt-1"
                  @click.stop.prevent="toggleTransactionsView(discountRecipient)"
                  >View Transactions >></button
                >
              </div>
            </div>
          </div>
        </div>

        <div class="jumbotron bg-soft-dark mt-4" v-if="selectedDiscountRecipientsTransactionsView">
          <button
            class="btn btn-dark px-5 mb-5"
            @click.stop.prevent="selectedDiscountRecipientsTransactionsView = false"
            ><< Go Back to the List of Discount Recipients</button
          >
          <ShowManagementTransactions
            v-if="selectedDiscountRecipient !== null"
            list-name="authorized_for_discounts"
            name-display-title="Discount Granted To"
            :transactions-display-title="
              `Discount Transactions For ${selectedDiscountRecipient.full_name.toUpperCase()}`
            "
            :management-list-item-id="selectedDiscountRecipient.id"
            complementary-total-display-title="Total Discount"
          ></ShowManagementTransactions>
          <button
            class="btn btn-dark px-5 mt-2 mb-5"
            @click.stop.prevent="selectedDiscountRecipientsTransactionsView = false"
            ><< Go Back to the List of Discount Recipients</button
          >
        </div>
      </div>
    </div>

    <div class="mt-2" v-if="currentTab === 'All Discount Transactions'">
      <ShowManagementTransactions
        list-name="authorized_for_discounts"
        name-display-title="Discount Granted To"
        :transactions-display-title="`All Discount Transactions`"
        complementary-total-display-title="Total Discount"
      ></ShowManagementTransactions>
    </div>
    <b-modal
      @hide="getDiscountRecipientsData"
      id="edit-discount-recipient"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Discount Recipient"
    >
      <FormBackground>
        <SaveDiscountReceiver :discount-receiver="selectedDiscountRecipient"></SaveDiscountReceiver>
      </FormBackground>
    </b-modal>
    <b-modal
      @hide="getDiscountRecipientsData"
      id="create-discount-recipient"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Save Discount Recipient"
    >
      <FormBackground>
        <SaveDiscountReceiver add-multiple></SaveDiscountReceiver>
      </FormBackground>
    </b-modal>
  </Layout>
</template>

<style scoped></style>
