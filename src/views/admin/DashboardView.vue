<template>
  <main class="flex-1 p-8 max-w-full overflow-x-auto">
 
  <section class="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-10 max-w-md">
   <div class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] w-full sm:w-auto">
    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#1E40AF]">
     <i class="fas fa-building text-white text-sm">
     </i>
    </div>
    <div>
     <p class="text-[#1E40AF] font-semibold text-lg leading-none">
      35
     </p>
     <p class="text-xs text-[#6B7280]">
      Propriétés gérées
     </p>
    </div>
   </div>
   <div class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] w-full sm:w-auto">
    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#1E40AF]">
     <i class="fas fa-user-friends text-white text-sm">
     </i>
    </div>
    <div>
     <p class="text-[#1E40AF] font-semibold text-lg leading-none">
      25
     </p>
     <p class="text-xs text-[#6B7280]">
      Propriétés actuellement louées
     </p>
    </div>
   </div>
   <div class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-sm border border-[#E5E7EB] w-full sm:w-auto">
    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#1E40AF]">
     <i class="fas fa-door-open text-white text-sm">
     </i>
    </div>
    <div>
     <p class="text-[#1E40AF] font-semibold text-lg leading-none">
      10
     </p>
     <p class="text-xs text-[#6B7280]">
      Propriétés disponibles
     </p>
    </div>
   </div>
  </section>
  <!-- Content grid -->
  <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
   <!-- Left: Recent Properties -->
   <div class="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-[#E5E7EB]">
    <div class="flex justify-between items-center mb-6">
     <h2 class="font-semibold text-base text-[#1F2937]">
      Vos Propriétés récentes
     </h2>
     <button aria-label="Next" class="text-[#6B7280] hover:text-[#1F2937] focus:outline-none">
      <i class="fas fa-chevron-right">
      </i>
     </button>
    </div>
    <table class="w-full text-left text-sm text-[#6B7280] border-collapse">
     <thead>
      <tr class="border-b border-[#E5E7EB]">
       <th class="py-3 pr-6 font-semibold w-10">
        #
       </th>
       <th class="py-3 pr-6 font-semibold">
        Propriété
       </th>
       <th class="py-3 pr-6 font-semibold">
        Bailleur
       </th>
       <th class="py-3 pr-6 font-semibold">
        Locataire
       </th>
       <th class="py-3 pr-6 font-semibold">
        Loyer
       </th>
       <th class="py-3 font-semibold w-10">
       </th>
      </tr>
     </thead>
     <tbody>
      <tr class="border-b border-[#E5E7EB]">
       <td class="py-3 pr-6 font-semibold text-[#9CA3AF]">
        01
       </td>
       <td class="py-3 pr-6">
        Appartement 820
       </td>
       <td class="py-3 pr-6">
        John Doe
       </td>
       <td class="py-3 pr-6">
        Jane Veller
       </td>
       <td class="py-3 pr-6">
        480$
       </td>
       <td class="py-3 text-center cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
        <i class="fas fa-ellipsis-h">
        </i>
       </td>
      </tr>
      <tr class="border-b border-[#E5E7EB]">
       <td class="py-3 pr-6 font-semibold text-[#9CA3AF]">
        02
       </td>
       <td class="py-3 pr-6">
        Appartement 820
       </td>
       <td class="py-3 pr-6">
        John Doe
       </td>
       <td class="py-3 pr-6">
        Jane Veller
       </td>
       <td class="py-3 pr-6">
        480$
       </td>
       <td class="py-3 text-center cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
        <i class="fas fa-ellipsis-h">
        </i>
       </td>
      </tr>
      <tr class="border-b border-[#E5E7EB]">
       <td class="py-3 pr-6 font-semibold text-[#9CA3AF]">
        03
       </td>
       <td class="py-3 pr-6">
        Appartement 820
       </td>
       <td class="py-3 pr-6">
        John Doe
       </td>
       <td class="py-3 pr-6">
        Jane Veller
       </td>
       <td class="py-3 pr-6">
        480$
       </td>
       <td class="py-3 text-center cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
        <i class="fas fa-ellipsis-h">
        </i>
       </td>
      </tr>
      <tr class="border-b border-[#E5E7EB]">
       <td class="py-3 pr-6 font-semibold text-[#9CA3AF]">
        04
       </td>
       <td class="py-3 pr-6">
        Appartement 820
       </td>
       <td class="py-3 pr-6">
        John Doe
       </td>
       <td class="py-3 pr-6">
        Jane Veller
       </td>
       <td class="py-3 pr-6">
        480$
       </td>
       <td class="py-3 text-center cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
        <i class="fas fa-ellipsis-h">
        </i>
       </td>
      </tr>
      <tr class="border-b border-[#E5E7EB]">
       <td class="py-3 pr-6 font-semibold text-[#9CA3AF]">
        05
       </td>
       <td class="py-3 pr-6">
        Appartement 820
       </td>
       <td class="py-3 pr-6">
        John Doe
       </td>
       <td class="py-3 pr-6">
        Jane Veller
       </td>
       <td class="py-3 pr-6">
        480$
       </td>
       <td class="py-3 text-center cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
        <i class="fas fa-ellipsis-h">
        </i>
       </td>
      </tr>
      <tr class="border-b border-[#E5E7EB]">
       <td class="py-3 pr-6 font-semibold text-[#9CA3AF]">
        06
       </td>
       <td class="py-3 pr-6">
        Appartement 820
       </td>
       <td class="py-3 pr-6">
        John Doe
       </td>
       <td class="py-3 pr-6">
        Jane Veller
       </td>
       <td class="py-3 pr-6">
        480$
       </td>
       <td class="py-3 text-center cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
        <i class="fas fa-ellipsis-h">
        </i>
       </td>
      </tr>
     </tbody>
    </table>
   </div>
   <!-- Right: Calendar and Alerts -->
   <div class="space-y-6">
    <!-- Calendar -->
    <div class="bg-white rounded-lg p-6 shadow-sm border border-[#E5E7EB] max-w-xs w-full">
     <div class="flex justify-between items-center mb-6">
      <div class="text-sm font-semibold text-[#1F2937]">
       Juin
      </div>
      <div class="text-xs text-[#6B7280]">
       2023
      </div>
     </div>
     <div class="grid grid-cols-7 gap-1 text-center text-xs text-[#6B7280] mb-2 select-none">
      <div>
       Lu
      </div>
      <div>
       Ma
      </div>
      <div>
       Me
      </div>
      <div>
       Je
      </div>
      <div>
       Ve
      </div>
      <div>
       Sa
      </div>
      <div>
       Di
      </div>
     </div>
     <div class="grid grid-cols-7 gap-1 text-center text-xs text-[#6B7280]">
      <div class="opacity-50">
       29
      </div>
      <div class="opacity-50">
       30
      </div>
      <div class="opacity-50">
       31
      </div>
      <div>
       1
      </div>
      <div>
       2
      </div>
      <div>
       3
      </div>
      <div>
       4
      </div>
      <div>
       5
      </div>
      <div>
       6
      </div>
      <div>
       7
      </div>
      <div>
       8
      </div>
      <div>
       9
      </div>
      <div>
       10
      </div>
      <div>
       11
      </div>
      <div>
       12
      </div>
      <div>
       13
      </div>
      <div>
       14
      </div>
      <div>
       15
      </div>
      <div>
       16
      </div>
      <div>
       17
      </div>
      <div>
       18
      </div>
      <div>
       19
      </div>
      <div>
       20
      </div>
      <div>
       21
      </div>
      <div>
       22
      </div>
      <div class="bg-[#2563EB] text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">
       23
      </div>
      <div>
       24
      </div>
      <div>
       25
      </div>
      <div>
       26
      </div>
      <div>
       27
      </div>
      <div>
       28
      </div>
      <div>
       29
      </div>
      <div>
       30
      </div>
      <div class="opacity-50">
       1
      </div>
      <div class="opacity-50">
       2
      </div>
     </div>
    </div>
    <!-- Alerts -->
    <div class="bg-white rounded-lg p-6 shadow-sm border border-[#E5E7EB] max-w-xs w-full">
     <h3 class="font-semibold text-[#1F2937] mb-4">
      Alertes
     </h3>
     <ul class="space-y-4">
      <li class="flex items-start space-x-3">
       <div class="flex-shrink-0 w-6 h-6 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]">
        <i class="fas fa-check-circle text-xs">
        </i>
       </div>
       <p class="text-xs text-[#065F46]">
        Martial Tanga a démissioné une location dans votre secteur
       </p>
      </li>
      <li class="flex items-start space-x-3">
       <div class="flex-shrink-0 w-6 h-6 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]">
        <i class="fas fa-check-circle text-xs">
        </i>
       </div>
       <p class="text-xs text-[#065F46]">
        Moussah Kou a démissioné une location dans votre secteur
       </p>
      </li>
      <li class="flex items-start space-x-3">
       <div class="flex-shrink-0 w-6 h-6 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981]">
        <i class="fas fa-check-circle text-xs">
        </i>
       </div>
       <p class="text-xs text-[#065F46]">
        Elie Oko annonce une location dans votre secteur
       </p>
      </li>
     </ul>
    </div>
   </div>
  </section>
 </main>
</template>

<script lang="ts">

</script>
