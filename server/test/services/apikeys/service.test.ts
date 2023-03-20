import test from 'ava'
import { ApikeyService } from '../../../src/services/apikeys/index.js'
import { ApikeyRepository } from '../../../src/services/apikeys/types.js'

const mockRepository = {
	create: (accountId: string, createdBy: string, hashedToken: string) => Promise.resolve({
		_id: 'apikey_asdfaf',
		account_id: accountId,
		user_id: createdBy,
		hashed_token: hashedToken,
		created_at: new Date(),
		revoked_at: null,
	}),
} as unknown as ApikeyRepository

test('generates keys in the correct format', async t => {
	const s = new ApikeyService({ repository: mockRepository })

	const k = await s.create('acc_1', 'usr_1')

	t.truthy(k.key._id)

	const parts = k.secret.split('_')

	t.is(parts[1], 'sk')
	t.truthy(parts[0])
	t.truthy(parts[2])
})

test('can identify valid keys', async t => {
	const s = new ApikeyService({ repository: mockRepository })

	t.true(s.looksLikeToken('sk_1f23f12f12f12'))
	t.true(s.looksLikeToken('test_sk_1f23f12f12f12'))
	t.false(s.looksLikeToken('ak_1f23f12f12f12'))
	t.false(s.looksLikeToken('test_ak_1f23f12f12f12'))
	t.false(s.looksLikeToken('1f23f12f12f12'))
})

test('does not store plaintext secrets', async t => {
	const s = new ApikeyService({ repository: mockRepository })

	const k = await s.create('acc_1', 'usr_1')

	t.not(k.key.hashed_token, k.secret)
})
