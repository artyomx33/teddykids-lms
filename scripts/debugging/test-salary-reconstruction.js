/**
 * 🧪 Test Salary Progression Reconstruction
 */

import { SalaryProgressionReconstructor } from './src/lib/salary-progression-reconstructor.ts';

async function testSalaryReconstruction() {
  console.log('🧪 Testing Adéla salary progression reconstruction...');

  try {
    // Run the reconstruction
    await SalaryProgressionReconstructor.reconstructAdelaSalaryProgression();

    // Verify it worked
    await SalaryProgressionReconstructor.verifySalaryProgression('8842f515-e4a3-40a4-bcfc-641399463ecf');

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSalaryReconstruction();