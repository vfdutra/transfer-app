<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function transfer(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255'
        ]);

        $sender = $request->user();
        $receiver = User::findOrFail($request->receiver_id);

        if ($sender->id === $receiver->id) {
            throw ValidationException::withMessages([
                'receiver_id' => ['Você não pode transferir para si mesmo.']
            ]);
        }

        if ($sender->balance < $request->amount) {
            throw ValidationException::withMessages([
                'amount' => ['Saldo insuficiente para realizar a transferência.']
            ]);
        }

        try {
            DB::beginTransaction();

            $transaction = Transaction::create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'amount' => $request->amount,
                'type' => 'transfer',
                'status' => 'pending',
                'description' => $request->description
            ]);

            // Atualiza o saldo do remetente
            $sender->balance -= $request->amount;
            $sender->save();

            // Atualiza o saldo do destinatário
            $receiver->balance += $request->amount;
            $receiver->save();

            // Atualiza o status da transação
            $transaction->status = 'completed';
            $transaction->save();

            DB::commit();

            return response()->json([
                'message' => 'Transferência realizada com sucesso',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Reverte a transação se houver erro
            if (isset($transaction)) {
                $transaction->status = 'failed';
                $transaction->save();
            }

            return response()->json([
                'message' => 'Erro ao realizar transferência',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255'
        ]);

        $user = $request->user();

        try {
            DB::beginTransaction();

            $transaction = Transaction::create([
                'sender_id' => $user->id,
                'receiver_id' => $user->id,
                'amount' => $request->amount,
                'type' => 'deposit',
                'status' => 'pending',
                'description' => $request->description
            ]);

            // Atualiza o saldo do usuário
            $user->balance += $request->amount;
            $user->save();

            // Atualiza o status da transação
            $transaction->status = 'completed';
            $transaction->save();

            DB::commit();

            return response()->json([
                'message' => 'Depósito realizado com sucesso',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Reverte a transação se houver erro
            if (isset($transaction)) {
                $transaction->status = 'failed';
                $transaction->save();
            }

            return response()->json([
                'message' => 'Erro ao realizar depósito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request)
    {
        $user = $request->user();
        
        $transactions = Transaction::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($transactions);
    }

    public function reverse(Request $request, Transaction $transaction)
    {
        if ($transaction->status !== 'completed') {
            throw ValidationException::withMessages([
                'transaction' => ['Apenas transações completadas podem ser revertidas.']
            ]);
        }

        if ($transaction->sender_id !== $request->user()->id) {
            throw ValidationException::withMessages([
                'transaction' => ['Você só pode reverter suas próprias transações.']
            ]);
        }

        try {
            DB::beginTransaction();

            $sender = User::findOrFail($transaction->sender_id);
            $receiver = User::findOrFail($transaction->receiver_id);

            // Reverte os saldos
            $sender->balance += $transaction->amount;
            $receiver->balance -= $transaction->amount;

            $sender->save();
            $receiver->save();

            // Atualiza o status da transação
            $transaction->status = 'reversed';
            $transaction->save();

            DB::commit();

            return response()->json([
                'message' => 'Transação revertida com sucesso',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao reverter transação',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 