<script>
  /**
   * A stat widget to show data with tiny chart visulization
   */
  export default {
    props: {
      mainTitle: {
        type: String,
        default: "",
      },
      value: {
        type: Number,
        default: 0,
      },
      isMoney: {
        type: Boolean,
        default: false,
      },
      subValue: {
        type: String,
        default: "",
      },
      chartColor: {
        type: String,
        default: "#5369f8",
      },
    },
    data() {
      return {
        chartOptions: {
          chart: {
            sparkline: {
              enabled: true,
            },
            parentHeightOffset: 0,
            toolbar: {
              show: false,
            },
          },
          colors: [this.chartColor],
          height: 45,
          width: 90,
          markers: { size: 0 },
          fill: {
            type: "gradient",
            gradient: {
              type: "vertical",
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.45,
              opacityTo: 0.05,
              stops: [45, 100],
            },
          },
          tooltip: {
            theme: "dark",
            fixed: {
              enabled: false,
            },
            x: {
              show: false,
            },
            y: {
              title: {
                formatter: (seriesName) => {
                  return ""
                },
              },
            },
            marker: {
              show: false,
            },
          },
          stroke: { width: 2, curve: "smooth" },
        },
      }
    },
  }
</script>
<template>
  <div class="card">
    <div class="card-body p-0">
      <div class="media p-3">
        <div class="media-body">
          <span class="text-muted text-uppercase font-size-12 font-weight-bold">{{ mainTitle }}</span>
          <h2 class="mb-0" v-if="isMoney">{{ value | money }}</h2>
          <h2 class="mb-0" v-else>{{ value }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>
