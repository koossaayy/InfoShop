<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryItemStore;
use App\Models\InventoryTransaction;
use App\Models\InventoryTransactionItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    public function index()
    {
        $stores = Store::select('id', 'name')->get();
        $inventory_items = InventoryItem::join('inventory_item_stores', 'inventory_items.id', '=', 'inventory_item_stores.inventory_item_id')
            ->select('inventory_items.*', 'inventory_item_stores.store_id', 'inventory_item_stores.quantity')
            ->paginate(100);
        return Inertia::render('Inventory/Inventory', [
            'inventory_items' => $inventory_items,
            'stores' => $stores,
            'pageLabel' => __('Inventory'),
        ]);
    }

    public function store(Request $request)
    {

        DB::beginTransaction();
        try {
            $inventory_item = new InventoryItem();
            $inventory_item->fill($request->only($inventory_item->fillable));
            $inventory_item->save();

            InventoryItemStore::create([
                'inventory_item_id' => $inventory_item->id,
                'store_id' => $request->store_id,
                'quantity' => $request->quantity
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item added successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error adding inventory item',
            ], 500);
        }
    }

    public function update(Request $request)
    {
        DB::beginTransaction();
        try {
            $inventory_item = InventoryItem::find($request->id);
            if (!$inventory_item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found',
                ], 404);
            }

            $inventory_item->fill($request->only($inventory_item->fillable));
            $inventory_item->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json([
                'success' => false,
                'message' => 'Error updating inventory item',
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $inventoryItem = InventoryItem::find($id);

            if (!$inventoryItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found',
                ], 404);
            }

            // Delete associated inventory transaction items
            InventoryTransactionItem::where('inventory_item_id', $id)->delete();

            // Delete associated inventory item stores
            InventoryItemStore::where('inventory_item_id', $id)->delete();

            // Delete the inventory item
            $inventoryItem->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error deleting inventory item',
            ], 500);
        }
    }


    public function inventorySingleTransactionStore(Request $request)
    {
        DB::beginTransaction();
        try {
            $inventoryItem = InventoryItem::find($request->inventory_item_id);

            if (!$inventoryItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Inventory item not found',
                ], 404);
            }

            $inventoryTransaction = InventoryTransaction::create([
                'store_id' => $request->store_id,
                'transaction_type' => $request->transaction_type,
                'reason' => $request->reason,
                'total' => 0,
                'transaction_date' => $request->transaction_date,
            ]);

            InventoryItemStore::updateOrCreate(
                ['inventory_item_id' => $request->inventory_item_id, 'store_id' => $request->store_id],
                ['quantity' => DB::raw('COALESCE(quantity, 0) + ' . $request->quantity)],
            );

            InventoryTransactionItem::create([
                'inventory_transaction_id' => $inventoryTransaction->id,
                'inventory_item_id' => $request->inventory_item_id,
                'quantity' => $request->quantity,
                'cost' => 0,
                'transaction_date' => $request->transaction_date
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item added successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json([
                'success' => false,
                'message' => 'Error adding inventory item',
            ], 500);
        }
    }

    public function inventoryPurchase()
    {
        $stores = Store::all();
        $inventoryItems = InventoryItem::all();
        return Inertia::render('Inventory/InventoryPurchase', [
            'stores' => $stores,
            'inventory_items' => $inventoryItems,
            'pageLabel' => __('Inventory Purchase'),
        ]);
    }

    public function inventoryPurchaseStore(Request $request)
    {
        DB::beginTransaction();
        try {
            $items = json_decode($request->items, true);
            $inventoryTransaction = InventoryTransaction::create([
                'store_id' => $request->store_id,
                'transaction_type' => 'purchase',
                'reason' => __('Purchase'),
                'total' => $request->total,
                'transaction_date' => $request->transaction_date,
            ]);

            foreach ($items as $item) {
                $item_id = $item['item']['id'];
                InventoryItemStore::updateOrCreate(
                    ['inventory_item_id' => $item_id, 'store_id' => $request->store_id],
                    ['quantity' => DB::raw('COALESCE(quantity, 0) + ' . $item['quantity'])],
                );

                InventoryTransactionItem::create([
                    'inventory_transaction_id' => $inventoryTransaction->id,
                    'inventory_item_id' => $item_id,
                    'quantity' => $item['quantity'],
                    'cost' => $item['unitCost'],
                    'transaction_date' => $request->transaction_date
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item added successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json([
                'success' => false,
                'message' => 'Error adding inventory item',
            ], 500);
        }
    }

    public function inventoryLogs()
    {
        $stores = Store::all();
        $inventory_log = InventoryTransactionItem::join('inventory_items', 'inventory_transaction_items.inventory_item_id', '=', 'inventory_items.id')
            ->join('inventory_transactions', 'inventory_transaction_items.inventory_transaction_id', '=', 'inventory_transactions.id')
            ->select('inventory_transaction_items.*', 'inventory_items.name', 'inventory_items.unit_type', 'inventory_transactions.reason')
            ->latest()
            ->paginate(100);
        return Inertia::render('Inventory/InventoryLog', [
            'stores' => $stores,
            'inventory_log' => $inventory_log,
            'pageLabel' => __('Inventory Logs'),
        ]);
    }
}
