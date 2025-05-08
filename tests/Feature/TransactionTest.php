<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function testTransferenciaComSaldoNegativo()
    {
        $sender = User::factory()->create(['balance' => 0]);
        $receiver = User::factory()->create(['balance' => 0]);

        $this->actingAs($sender, 'sanctum')
            ->postJson('/api/transactions/transfer', [
                'receiver_id' => $receiver->id,
                'amount' => 100,
            ])
            ->assertStatus(200);

        $this->assertEquals(-100, $sender->fresh()->balance);
        $this->assertEquals(100, $receiver->fresh()->balance);
    }

    public function testDepositoAbateSaldoNegativo()
    {
        $user = \App\Models\User::factory()->create(['balance' => -50]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions/deposit', [
                'amount' => 100,
            ])
            ->assertStatus(200);

        // O saldo final deve ser 50: -50 + 100 = 50
        $this->assertEquals(50, $user->fresh()->balance);
    }

    public function testRecebimentoDeTransferenciaAbateSaldoNegativo()
    {
        $sender = \App\Models\User::factory()->create(['balance' => 200]);
        $receiver = \App\Models\User::factory()->create(['balance' => -80]);

        $this->actingAs($sender, 'sanctum')
            ->postJson('/api/transactions/transfer', [
                'receiver_id' => $receiver->id,
                'amount' => 50,
            ])
            ->assertStatus(200);

        // O receiver tinha -80, recebeu 50, deve ficar com -30
        $this->assertEquals(-30, $receiver->fresh()->balance);
        // O sender tinha 200, enviou 50, deve ficar com 150
        $this->assertEquals(150, $sender->fresh()->balance);
    }
}
