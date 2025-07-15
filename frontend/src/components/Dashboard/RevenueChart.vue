<template>
  <v-card class="pa-4 d-flex flex-column fill-height">
    <v-card-title class="text-h6">Chiffre d'affaires mensuel</v-card-title>
    <v-divider class="my-2" />

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedYear"
          :items="availableYears"
          label="Sélectionner une année"
          dense
        />
      </v-col>
    </v-row>

    <div class="flex-grow">
      <Line :chart-data="chartData" :chart-options="chartOptions" />
    </div>
  </v-card>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import type { Invoice } from '@/schemas/invoice.schema';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps<{
  invoices: Invoice[];
}>();

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);

const availableYears = computed(() => {
  const years = props.invoices.map(inv => new Date(inv.dueDate).getFullYear());
  return Array.from(new Set(years)).sort((a, b) => b - a);
});

const chartData = computed(() => {
  const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const dataByMonth = Array(12).fill(0);

  props.invoices.forEach(inv => {
    if (inv.status === INVOICE_STATUS.PAID) {
      const date = new Date(inv.dueDate);
      if (date.getFullYear() === selectedYear.value) {
        const month = date.getMonth() - 1;
        const amountVar = inv.variableValues.find(v =>
          ['amount', 'total_amount', 'montant', 'total_ht', 'total_ttc'].includes(
            v.variableName.toLowerCase()
          )
        );
        const total = amountVar ? parseFloat(amountVar.value) || 0 : 0;
        dataByMonth[month] += total;
      }
    }
  });

  return {
    labels,
    datasets: [
      {
        label: "Chiffre d'affaires (€)",
        data: dataByMonth,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2.5,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number } }) => `${context.parsed.y.toFixed(2)} €`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(tickValue: string | number) {
          return `${tickValue} €`;
        }
      }
    }
  }
};
</script>
