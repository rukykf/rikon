<script>
import Layout from "@layouts/main"
import pdfMake from "pdfmake"
import pdfFonts from "./components/vfs_fonts"
import { DateTime } from "luxon"
import ManagedStateButton from "../../../../components/managed-state-button"

export default {
 name: "rikon-letterhead-report",
 components: { ManagedStateButton, Layout },
 data() {
  return {
   success: [],
   errors: [],
   reportHeadings: ["Name", "Bank", "Account Number", "Amount (naira)"],
   reportData: [],
   itemForSave: [],
   itemForSaveIndex: null,
   newHeading: "",
   openingLines: ["Pay into Rikon Account"],
   newOpeningLine: "",
   signatory: "Dr. Richard Kofi",
   signatoryRequired: true,
   docDefinition: {
    header: [
     {
      columns: [
       {
        image:
         "data:image/png;base64,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",
        width: 128,
        height: 128,
        margin: [25, 0, 10, 40],
        alignment: "left",
       },
       [
        {
         stack: [
          { text: "Rikon Hotels", color: "blue" },
          "rikonhotels@gmail.com",
          "08128952479, 08030680403",
          "Ovwor New Road, Ovwor-Olomu",
          "Ughelli South L.G.A, Delta State, Nigeria",
         ],
         alignment: "right",
         margin: [10, 30, 20, 40],
        },
       ],
      ],
     },
    ],
    footer: [
     {
      margin: [20, 10, 30, 0],
      stack: ["______________________", { text: "Dr. Richard Kofi", margin: [15, 0, 0, 0] }],
     },
    ],
    content: [
     {
      margin: [0, 30, 10, 0],
      stack: ["Pay into Account: 1099999999 of Zenith Bank", "08128952479, 08030680403"],
     },
     {
      margin: [0, 30, 10, 100],
      layout: "lightHorizontalLines", // optional
      table: {
       // headers are automatically repeated if the table spans over multiple pages
       // you can declare how many rows should be treated as headers
       headerRows: 1,
       widths: ["*", "*", "*", "*"],
       body: [],
      },
     },
    ],

    pageMargins: [30, 120, 50, 40],
   },
  }
 },

 methods: {
  showEditHeadingsModal() {
   this.$bvModal.show("edit-headings-modal")
  },

  showSaveItemModal(itemIndex) {
   if (itemIndex === null) {
    this.itemForSave = []
    this.itemForSaveIndex = null
    this.$bvModal.show("save-report-item-modal")
   } else {
    this.itemForSaveIndex = itemIndex
    this.itemForSave = this.reportData[itemIndex]
    this.$bvModal.show("save-report-item-modal")
   }
  },

  showEditOpeningAndClosingRemarksModal() {
   this.$bvModal.show("edit-opening-closing-remarks")
  },

  saveOpeningAndClosingRemarks() {
   this.$bvModal.hide("edit-opening-closing-remarks")
  },

  addItemToReportData() {
   if (this.itemForSaveIndex === null) {
    this.reportData.push(this.itemForSave)
    this.itemForSave = []
    this.itemForSaveIndex = null
   }
   this.$bvModal.hide("save-report-item-modal")
  },

  updateSignatory() {
   if (this.signatoryRequired === true) {
    this.docDefinition.footer.stack = [
     "______________________",
     {
      text: this.signatory,
      margin: [15, 0, 0, 0],
     },
    ]
   } else {
    this.docDefinition.footer.stack = []
   }
  },

  deleteItemFromReportData(index) {
   this.reportData.splice(index, 1)
  },

  removeHeading(index) {
   this.reportHeadings.splice(index, 1)
   this.reportData = []
  },

  removeOpeningLine(index) {
   this.openingLines.splice(index, 1)
  },

  addOpeningLine() {
   if (this.newOpeningLine.length > 1) {
    this.openingLines.push(this.newOpeningLine)
    this.newOpeningLine = ""
   }
  },

  addNewHeading() {
   this.reportHeadings.push(this.newHeading)
   this.newHeading = ""
   this.reportData = []
  },

  printPDF() {
   let fonts = {
    Roboto: {
     normal: "Roboto-Regular.ttf",
     bold: "Roboto-Medium.ttf",
     italics: "Roboto-Italic.ttf",
     bolditalics: "Roboto-MediumItalic.ttf",
    },
   }

   // customize the opening lines of the document
   this.docDefinition.content[0].stack = this.openingLines

   // customize the table generated by the document
   this.docDefinition.content[1].table.widths = []
   let headingsElements = []
   this.reportHeadings.forEach((heading) => {
    this.docDefinition.content[1].table.widths.push("*")
    headingsElements.push({ text: heading, bold: true })
   })

   let tableItems = []
   tableItems.push(headingsElements)
   this.reportData.forEach((item) => {
    tableItems.push(item)
   })

   this.docDefinition.content[1].table.body = tableItems
   return pdfMake
    .createPdf(this.docDefinition, null, fonts, pdfFonts)
    .download(`Rikon-Report-on-${DateTime.local().toISODate()}.pdf`)
  },
 },
}
</script>

<template>
 <Layout>
  <a href="#" class="btn btn-success px-4 mt-4 mr-2" @click.stop.prevent="printPDF">Download PDF</a>
  <a href="#" class="btn btn-dark px-4 mt-4 mx-2" @click.stop.prevent="showEditHeadingsModal">Edit Report Headings</a>
  <a href="#" class="btn btn-dark px-4 mt-4 mx-2" @click.stop.prevent="showSaveItemModal(null)"
   >Add New Row to Report</a
  >
  <a href="#" class="btn btn-dark px-4 mt-4 mx-2" @click.stop.prevent="showEditOpeningAndClosingRemarksModal"
   >Edit Opening Remarks</a
  >

  <div class="card mt-4">
   <div class="card-body">
    <table class="table table-responsive table-hover mt-4">
     <thead>
      <th v-for="(heading, index) in reportHeadings" :key="index">
       {{ heading }}
      </th>
      <th>Actions</th>
     </thead>
     <tbody>
      <tr v-for="(item, index) in reportData" :key="index">
       <td v-for="(cell, cellIndex) in item" :key="cellIndex">
        {{ cell }}
       </td>
       <td>
        <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="showSaveItemModal(index)"
         >Edit Item</a
        >
        <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="deleteItemFromReportData(index)"
         >Delete Item</a
        >
       </td>
      </tr>
     </tbody>
    </table>
   </div>
  </div>

  <b-modal
   id="edit-opening-closing-remarks"
   size="lg"
   hide-footer
   header-bg-variant="dark"
   title="Add New Item to the beginning of the Report"
  >
   <h4>Opening Lines at the top of the Document: </h4>
   <hr />
   <div class="form-group">
    <label for="newOpeningLine">
     <h6>Add an Opening Line: </h6>
    </label>
    <input
     id="newOpeningLine"
     v-model="newOpeningLine"
     type="text"
     name="newOpeningLine"
     placeholder=""
     class="form-control "
    />
   </div>

   <p>
    <ManagedStateButton main-title="Add Opening Line" @clicked="addOpeningLine"></ManagedStateButton>
   </p>

   <hr />
   <div v-for="(remark, index) in openingLines" :key="index" class="mt-4">
    <span class="align-bottom ml-5">{{ remark }}</span>
    <a
     href="#"
     class="pr-lg-2 ml-2 align-bottom"
     v-b-tooltip.hover
     title="Remove This Line"
     @click.prevent.stop="removeOpeningLine(index)"
    >
     <feather type="x-circle"></feather>
    </a>
    <hr />
   </div>

   <br />
   <br />
  </b-modal>

  <b-modal
   id="save-report-item-modal"
   size="lg"
   hide-footer
   header-bg-variant="dark"
   title="Add New Item to the Report"
  >
   <div v-for="(heading, index) in reportHeadings" :key="index">
    <label>
     <h6>{{ heading }}: </h6>
    </label>
    <input v-model="itemForSave[index]" type="text" placeholder="" class="form-control " />
   </div>
   <ManagedStateButton
    class="mt-3"
    main-title="Save Item"
    @clicked="addItemToReportData"
    state="initialize"
   ></ManagedStateButton>
  </b-modal>

  <b-modal id="edit-headings-modal" size="lg" hide-footer header-bg-variant="dark" title="Edit Table Headings">
   <div v-for="(heading, index) in reportHeadings" :key="index" class="mt-4">
    <span class="align-bottom">{{ heading }}</span>
    <a
     href="#"
     class="pr-lg-2 ml-2 align-bottom"
     v-b-tooltip.hover
     title="Remove Heading"
     @click.prevent.stop="removeHeading(index)"
    >
     <feather type="x-circle"></feather>
    </a>
    <hr />
   </div>

   <div class="form-group">
    <label for="newHeading">
     <h6>Enter New Heading: </h6>
    </label>
    <input id="newHeading" v-model="newHeading" type="text" name="newHeading" placeholder="" class="form-control " />
   </div>

   <p>
    <ManagedStateButton main-title="Add Heading" @clicked="addNewHeading"></ManagedStateButton>
   </p>
  </b-modal>
 </Layout>
</template>

<style scoped></style>
