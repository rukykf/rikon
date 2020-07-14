<script>
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import SaveUser from "../../../../components/save-user"
  import SaveUserRole from "../../../../components/save-user-role"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"
  import _ from "lodash"

  export default {
    page: {
      title: "Users & Roles",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: {
      SaveUserRole,
      SaveUser,
      SuccessFailureAlert,
      Layout,
    },
    data: function() {
      return {
        tabs: ["Users", "Roles"],
        currentTab: "Users",
        errors: [],
        success: [],
        loading: false,
        users: [],
        roles: [],
        userPrimary: "id",
        userFields: [
          { key: "SN", label: "S/N", sortable: false },
          { key: "first_name", label: "First Name", sortable: true, sortDirection: "desc" },
          { key: "last_name", label: "Last Name", sortable: true, sortDirection: "desc" },
          { key: "role", label: "Role", sortable: true, sortDirection: "desc" },
          { key: "username", label: "Username", sortable: true, sortDirection: "desc" },
          { key: "actions", label: "Actions", sortable: false, sortDirection: "desc" },
        ],
        selectedUser: {
          id: null,
          first_name: null,
          last_name: null,
          role: null,
          role_id: null,
          username: null,
          password: null,
        },
        selectedRole: {
          id: null,
          name: null,
          permissions: null,
        },
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
        pageOptions: [10, 25, 50, 100],
        filter: null,
        filterOn: [],
        sortBy: "age",
        sortDesc: false,
      }
    },
    computed: {
      userRows: function() {
        return this.users.length
      },
      roleRows: function() {
        return this.roles.length
      },
    },
    mounted: function() {
      this.updateUsersAndRolesData()
    },
    methods: {
      updateUsersAndRolesData: async function() {
        try {
          this.loading = true
          let usersData = await this.$httpClient.get("api/users")
          let rolesData = await this.$httpClient.get("api/roles")
          this.users = []
          usersData.data.forEach((user) => {
            let isValid = true
            user.role.permissions.forEach((permission) => {
              if (!_.includes(this.$store.state.auth.currentUser.role.permissions, permission)) {
                isValid = false
              }
            })
            if (isValid) {
              this.users.push(user)
            }
          })

          this.roles = []
          rolesData.data.forEach((role) => {
            let isValid = true
            role.permissions.forEach((permission) => {
              if (!_.includes(this.$store.state.auth.currentUser.role.permissions, permission)) {
                isValid = false
              }
            })
            if (isValid) {
              this.roles.push(role)
            }
          })
          this.loading = false
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
      async deleteUser(user, target) {
        try {
          target.innerHTML = "Deleting..."
          let url = `api/users/${user.id}`
          await this.$httpClient.delete(url)
          this.success.push(`Successfully deleted user with username: ${user.username}`)
          this.updateUsersAndRolesData()
        } catch (error) {
          target.innerHTML = "Delete User"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async deleteRole(role, target) {
        try {
          target.innerHTML = "Deleting..."
          let url = `api/roles/${role.id}`
          await this.$httpClient.delete(url)
          this.success.push(`successfully deleted role: ${role.name}`)
          this.updateUsersAndRolesData()
        } catch (error) {
          target.innerHTML = "Delete Role"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showEditUserModal: function(selectedUser) {
        this.selectedUser = selectedUser
        this.$bvModal.show("save-user")
      },
      showEditRoleModal: function(selectedRole) {
        this.selectedRole = selectedRole
        this.$bvModal.show("save-role")
      },
      showCreateUserModal: function() {
        this.$bvModal.show("create-user")
      },
      showCreateRoleModal: function() {
        this.$bvModal.show("create-role")
      },
    },
  }
</script>
<template>
  <Layout>
    <div class="mt-4">
      <b-nav tabs justified>
        <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
          <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{
            tab[0].toUpperCase() + tab.slice(1)
          }}</h5>
        </b-nav-item>
      </b-nav>
      <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

      <div class="card mt-3">
        <div class="card-body">
          <div v-if="loading">
            <div class="text-center my-5">
              <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
            </div>
          </div>
          <div v-else-if="currentTab === 'Users'">
            <div class="row">
              <div class="col-12">
                <button class="btn btn-primary mt-3 mb-5 px-5" @click.prevent.stop="showCreateUserModal"
                  >Add New User
                </button>
              </div>
            </div>
            <div class="row mb-md-4">
              <div class="col-sm-12 col-md-6">
                <div class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Show&nbsp;
                    <b-form-select v-model="perPage" size="sm" :options="pageOptions"></b-form-select>&nbsp;entries
                  </label>
                </div>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div class="dataTables_filter text-md-right">
                  <label class="d-inline-flex align-items-center">
                    Search:
                    <b-form-input
                      v-model="filter"
                      type="search"
                      placeholder="Search..."
                      class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <div v-show="true" class="table-responsive  table-hover mb-0">
              <b-table
                :items="users"
                :fields="userFields"
                :primary-key="userPrimary"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                id="users-table"
              >
                <template v-slot:cell(SN)="row">
                  {{ row.index + 1 }}
                </template>

                <template v-slot:cell(role)="row">
                  {{ row.item.role.name }}
                </template>

                <template v-slot:cell(actions)="row">
                  <a
                    class="badge badge-primary text-white mx-1"
                    href="#"
                    @click.stop.prevent="showEditUserModal(row.item)"
                    >Edit User / Reset Password</a
                  >
                  <a
                    class="badge badge-danger text-white mx-1"
                    href="#"
                    @click.stop.prevent="deleteUser(row.item, $event.target)"
                    >Delete User</a
                  >
                </template>
              </b-table>
            </div>
            <div class="row">
              <div class="col">
                <div class="dataTables_paginate paging_simple_numbers float-right">
                  <ul class="pagination pagination-rounded mb-0">
                    <!-- pagination -->
                    <b-pagination v-model="currentPage" :total-rows="userRows" :per-page="perPage"></b-pagination>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="currentTab === 'Roles'">
            <div class="row my-3">
              <div class="col-12">
                <button class="btn btn-primary px-5" @click.stop.prevent="showCreateRoleModal">Add New Role</button>
              </div>
            </div>
            <div class="table-responsive  table-hover mb-0">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Role Name</th>
                    <th>Role Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(role, index) in roles" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ role.name }}</td>
                    <td
                      ><span v-for="(permission, roleIndex) in role.permissions" :key="roleIndex"
                        >{{ permission }},
                      </span>
                    </td>
                    <td>
                      <a
                        class="badge badge-primary text-white mx-1"
                        href="#"
                        @click.stop.prevent="showEditRoleModal(role)"
                        >Edit Role</a
                      ><a
                        class="badge badge-danger text-white mx-1"
                        href="#"
                        @click.stop.prevent="deleteRole(role, $event.target)"
                        >Delete Role</a
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <b-modal
        @hide="updateUsersAndRolesData"
        id="save-user"
        size="xl"
        hide-footer
        header-bg-variant="dark"
        title="Save User"
      >
        <SaveUser :user="selectedUser"></SaveUser>
      </b-modal>
      <b-modal
        @hide="updateUsersAndRolesData"
        id="save-role"
        size="xl"
        hide-footer
        header-bg-variant="dark"
        title="Save Role"
      >
        <SaveUserRole :role="selectedRole"></SaveUserRole>
      </b-modal>
      <b-modal
        @hide="updateUsersAndRolesData"
        id="create-role"
        size="xl"
        hide-footer
        header-bg-variant="dark"
        title="Save Role"
      >
        <SaveUserRole addMultiple></SaveUserRole>
      </b-modal>
      <b-modal
        @hide="updateUsersAndRolesData"
        id="create-user"
        size="xl"
        hide-footer
        header-bg-variant="dark"
        title="Save User"
      >
        <SaveUser addMultiple></SaveUser>
      </b-modal>
    </div>
  </Layout>
</template>
