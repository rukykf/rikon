<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

import appConfig from '@src/app.config'
import Layout from '@layouts/main'

import StatChart from '@components/widget-stat-chart'
import Overview from '@components/overview'
import Member from '@components/member'
import Task from '@components/task'
import Chat from '@components/chat'

import {
	revenueAreaChart,
	targetsBarChart,
	salesDonutChart,
	ordersData,
} from './data'

/**
 * Dashboard-1 Component
 */
export default {
	page: {
		title: 'Dashboard',
		meta: [{ name: 'description', content: appConfig.description }],
	},
	components: {
		VuePerfectScrollbar,
		Layout,
		StatChart,
		Overview,
		Member,
		Task,
		Chat,
	},
	data() {
		return {
			revenueAreaChart: revenueAreaChart,
			targetsBarChart: targetsBarChart,
			salesDonutChart: salesDonutChart,
			ordersData: ordersData,

			maxHeight: '328px',
			overviewData: [
				{
					class: 'border-bottom py-4',
					icon: 'users',
					value: '121,000',
					title: 'Total Visitors',
				},
				{
					class: 'border-bottom py-4',
					icon: 'image',
					value: '21,000',
					title: 'Total Product Views',
				},
				{
					class: 'py-4',
					icon: 'shopping-bag',
					value: '$21.5',
					title: 'Revenue Per Visitor',
				},
			],
			membersData: [
				{
					image: require('@assets/images/users/avatar-7.jpg'),
					text: 'Senior Sales Guy',
					name: 'Shreyu N',
				},
				{
					image: require('@assets/images/users/avatar-9.jpg'),
					text: 'Social Media Campaign',
					name: 'Greeva Y',
				},
				{
					image: require('@assets/images/users/avatar-4.jpg'),
					text: 'Inventory Manager',
					name: 'Nik G',
				},
				{
					image: require('@assets/images/users/avatar-1.jpg'),
					text: 'Sales Persons',
					name: 'Hardik G',
				},
				{
					image: require('@assets/images/users/avatar-2.jpg'),
					text: 'Sales Persons',
					name: 'Stive K',
				},
			],
			tasksData: [
				{
					title: 'Draft the new contract document for sales team',
					text: 'Due on 24 Aug, 2019',
					id: 1,
				},
				{
					title: 'iOS App home page',
					text: 'Due on 23 Aug, 2019',
					id: 2,
				},
				{
					title: 'Write a release note for Shreyu',
					text: 'Due on 22 Aug, 2019',
					id: 3,
				},
				{
					title: 'Invite Greeva to a project shreyu admin',
					text: 'Due on 21 Aug, 2019',
					id: 4,
				},
				{
					title: 'Enable analytics tracking for main website',
					text: 'Due on 20 Aug, 2019',
					id: 5,
				},
				{
					title: 'Invite user to a project',
					text: 'Due on 28 Aug, 2019',
					id: 6,
				},
				{
					title: 'Write a release note',
					text: 'Due on 14 Aug, 2019',
					id: 7,
				},
			],
			statChart: [
				{
					mainTitle: 'Total Sales',
					value: 'N210,000',
					subValue: '10.21%',
					chartColor: '#5369f8',
				},
				{
					mainTitle: 'Total Cash Sales',
					value: 'N150,000',
					subValue: '5.05%',
					chartColor: '#f77e53',
				},
				{
					mainTitle: 'Total Credit Sales',
					value: 'N70,000',
					subValue: '25.16%',
					chartColor: '#43d39e',
				},
				{
					mainTitle: 'Total Pending Orders',
					value: 20,
					subValue: '5.05%',
					chartColor: '#ffbe0b',
				},
				{
					mainTitle: 'Booked Rooms',
					value: 30,
					subValue: '5.05%',
					chartColor: '#5369f8'
				},
				{
					mainTitle: 'Closed Orders',
					value: 50,
					subValue: '5.09%',
					chartColor: '#5369f8'
				}
			],
			chatMessages: [
				{
					id: 1,
					image: require('@assets/images/users/avatar-9.jpg'),
					name: 'Greeva',
					message: 'Hello!',
					time: '10:00',
				},
				{
					id: 2,
					image: require('@assets/images/users/avatar-7.jpg'),
					name: 'Shreyu',
					message: 'Hi, How are you? What about our next meeting?',
					time: '10:01',
				},
				{
					id: 3,
					image: require('@assets/images/users/avatar-9.jpg'),
					name: 'Greeva',
					message: 'Yeah everything is fine',
					time: '10:01',
				},
				{
					id: 4,
					image: require('@assets/images/users/avatar-7.jpg'),
					name: 'Shreyu',
					message: 'Awesome! let me know if we can talk in 20 min',
					time: '10:02',
				},
			],
			dateConfig: {
				mode: 'range',
			},
			selectedDate: [new Date().setDate(new Date().getDate() - 7), new Date()],
		}
	},
}
</script>

<template>
	<Layout>
		<div class="row page-title align-items-center">
			<div class="col-sm-4 col-xl-6">
				<h3 class="mb-1 mt-0">Today's Summary</h3>
			</div>
			<div class="col-sm-8 col-xl-6">
				<form class="form-inline float-sm-right mt-3 mt-sm-0">
					<div class="form-group mb-sm-0 mr-2">
						<flat-pickr
							v-model="selectedDate"
							class="form-control"
							:config="dateConfig"
							name="date"
						></flat-pickr>
					</div>
					<div class="btn-group">
						<b-dropdown variant="primary" right>
							<template v-slot:button-content>
								<i class="uil uil-file-alt mr-1"></i>Download
								<i class="icon">
									<feather type="chevron-down" class="align-middle"></feather>
								</i>
							</template>
							<b-dropdown-item href="#" class="notify-item">
								<feather
									type="mail"
									class="icon-dual icon-xs mr-2 align-middle"
								></feather>
								<span>Email</span>
							</b-dropdown-item>
							<b-dropdown-item href="#" class="notify-item">
								<feather
									type="printer"
									class="icon-dual icon-xs mr-2 align-middle"
								></feather>
								<span>Print</span>
							</b-dropdown-item>
							<b-dropdown-divider></b-dropdown-divider>
							<b-dropdown-item href="#" class="notify-item">
								<feather
									type="file"
									class="icon-dual icon-xs mr-2 align-middle"
								></feather>
								<span>Re-Generate</span>
							</b-dropdown-item>
						</b-dropdown>
					</div>
				</form>
			</div>
		</div>

		<div class="row">
			<div
				v-for="stat of statChart"
				:key="stat.mainTitle"
				class="col-md-6 col-xl-3"
			>
				<StatChart
					:main-title="stat.mainTitle"
					:value="stat.value"
					:sub-value="stat.subValue"
					:chart-color="stat.chartColor"
				/>
			</div>
		</div>

		<div class="row">

			<div class="col-xl-6">
				<div class="card">
					<div class="card-body pb-0">
						<ul class="nav card-nav float-right">
							<li class="nav-item">
								<a class="nav-link text-muted" href="javascript: void(0);"
									>Today</a
								>
							</li>
							<li class="nav-item">
								<a class="nav-link text-muted" href="javascript: void(0);"
									>7d</a
								>
							</li>
							<li class="nav-item">
								<a class="nav-link active" href="javascript: void(0);">15d</a>
							</li>
							<li class="nav-item">
								<a class="nav-link text-muted" href="javascript: void(0);"
									>1m</a
								>
							</li>
							<li class="nav-item">
								<a class="nav-link text-muted" href="javascript: void(0);"
									>1y</a
								>
							</li>
						</ul>
						<h5 class="card-title mb-0 header-title">Total Sales</h5>
						<!-- Revenue Area Chart -->
						<apexchart
							type="area"
							height="296"
							:series="revenueAreaChart.series"
							:options="revenueAreaChart.chartOptions"
						></apexchart>
						<!-- end revenue chart -->
					</div>
				</div>
			</div>

			<div class="col-xl-3">
				<div class="card">
					<div class="card-body pb-0">
						<h5 class="card-title header-title">Cash Sales vs. Credit Sales</h5>
						<!-- Target Radialbar chart -->
						<div class="mt-3">
							<apexchart
								type="bar"
								height="282"
								:series="targetsBarChart.series"
								:options="targetsBarChart.chartOptions"
							></apexchart>
						</div>
						<!-- end target chart -->
					</div>
				</div>
			</div>
		</div>

	</Layout>
</template>
